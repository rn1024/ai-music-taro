export interface LyricWord {
  word: string
  start: number
  end: number
}

export const findCurrentLyricIndex = (
  lyrics: LyricWord[],
  currentTime: number
): number => {
  for (let i = lyrics.length - 1; i >= 0; i--) {
    if (currentTime >= lyrics[i].start && currentTime < lyrics[i].end) {
      return i
    }
  }
  return -1
}

export const getVisibleLyrics = (
  lyrics: LyricWord[],
  currentIndex: number
): {
  past: LyricWord[]
  current: LyricWord | null
  future: LyricWord[]
} => {
  if (currentIndex < 0) {
    return {
      past: [],
      current: null,
      future: lyrics.slice(0, 2)
    }
  }

  const pastStart = Math.max(0, currentIndex - 2)
  const past = lyrics.slice(pastStart, currentIndex)
  const current = lyrics[currentIndex] || null
  const future = lyrics.slice(currentIndex + 1, currentIndex + 3)

  return { past, current, future }
}

export const formatLyricText = (word: string): string => {
  return word
    .trim()
    .replace(/^\[.*?\]\s*/gi, '')
    .replace(/^\{.*?\}\s*/gi, '')
    .replace(/\s+/g, ' ')
}

export const isInstrumental = (lyrics: LyricWord[]): boolean => {
  if (lyrics.length === 0) {
    return true
  }

  const hasValidLyrics = lyrics.some(
    lyric => lyric.word && formatLyricText(lyric.word).length > 0
  )

  return !hasValidLyrics
}
