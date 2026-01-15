import { View, Text } from '@tarojs/components'
import { useState, useEffect, useMemo, useRef } from 'react'
import type { LyricWord } from '../../utils/lyrics-sync'
import { findCurrentLyricIndex } from '../../utils/lyrics-sync'
import './lyrics-overlay.scss'

interface LyricsOverlayProps {
  lyrics: LyricWord[]
  currentTime: number
  isVisible: boolean
}

const VISIBLE_BEFORE = 2;
const VISIBLE_AFTER = 3;

export default function LyricsOverlay({
  lyrics,
  currentTime,
  isVisible
}: LyricsOverlayProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(-1)
  const prevIndexRef = useRef<number>(-1)

  useEffect(() => {
    if (lyrics.length === 0) return

    const index = findCurrentLyricIndex(lyrics, currentTime)
    if (index !== prevIndexRef.current) {
      prevIndexRef.current = index
      setCurrentIndex(index)
    }
  }, [currentTime, lyrics])

  const visibleLyrics = useMemo(() => {
    if (lyrics.length === 0) return []

    const effectiveIndex = currentIndex < 0 ? 0 : currentIndex
    const start = Math.max(0, effectiveIndex - VISIBLE_BEFORE)
    const end = Math.min(lyrics.length, effectiveIndex + VISIBLE_AFTER + 1)

    return lyrics.slice(start, end).map((lyric, idx) => {
      const absoluteIndex = start + idx
      const relativeIndex = absoluteIndex - effectiveIndex
      return {
        ...lyric,
        absoluteIndex,
        relativeIndex,
        type: relativeIndex < 0 ? 'past' : relativeIndex === 0 ? 'current' : 'future'
      }
    })
  }, [lyrics, currentIndex])

  if (!isVisible || lyrics.length === 0) {
    return null
  }

  return (
    <View className={`lyrics-overlay ${isVisible ? 'visible' : 'hidden'}`}>
      <View className="lyrics-container">
        {visibleLyrics.map((lyric) => {
          let className = 'lyric-line'
          if (lyric.type === 'past') {
            className += ` past past-${VISIBLE_BEFORE + lyric.relativeIndex}`
          } else if (lyric.type === 'current') {
            className += ' current'
          } else {
            className += ` future future-${lyric.relativeIndex - 1}`
          }

          return (
            <View key={`${lyric.start}-${lyric.absoluteIndex}`} className={className}>
              <Text className="lyric-text">{lyric.word}</Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}
