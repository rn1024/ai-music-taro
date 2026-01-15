import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { GlassCard, PageHeader } from '../../components'
import { deleteMusic, getMusicHistory, getMusicResult } from '../../services/music'
import type { MusicHistoryItem } from '../../types'
import { clockIcon, playIcon, pauseIcon, ellipsisIcon, historyIcon } from '../../assets/icons'
import { getAudioContext, toggleAudio } from '../../utils/audio'
import './index.scss'

const FILTERS = ['全部', '成功', '生成中', '失败']

const filterToStatus = (filterIndex: number) => {
  switch (filterIndex) {
    case 1:
      return 'success'
    case 2:
      return 'processing'
    case 3:
      return 'failed'
    default:
      return 'all'
  }
}

const formatDate = (date: string) => date.slice(0, 10)

export default function History() {
  const [activeFilter, setActiveFilter] = useState(0)
  const [history, setHistory] = useState<MusicHistoryItem[]>([])
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audioMap, setAudioMap] = useState<Record<string, string>>({})

  useEffect(() => {
    let audio: ReturnType<typeof getAudioContext> | null = null
    try {
      audio = getAudioContext()
    } catch {
      return
    }

    if (!audio) {
      return
    }
    const handleStop = () => setPlayingId(null)
    const handleError = () => {
      setPlayingId(null)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    }

    audio.onEnded(handleStop)
    audio.onStop(handleStop)
    audio.onError(handleError)

    return () => {
      audio.offEnded(handleStop)
      audio.offStop(handleStop)
      audio.offError(handleError)
    }
  }, [])

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const status = filterToStatus(activeFilter)
        const data = await getMusicHistory({ page: 1, perPage: 20, status })
        setHistory(data.list)
      } catch (error) {
        Taro.showToast({ title: '历史记录加载失败', icon: 'none' })
      }
    }

    fetchHistory()
  }, [activeFilter])

  const handleItemClick = (item: MusicHistoryItem) => {
    if (item.status === 'success') {
      Taro.navigateTo({ url: `/pages/result/index?music_id=${item.id}` })
    }
  }

  const handlePlay = (e: any, item: MusicHistoryItem) => {
    e.stopPropagation()
    if (item.status !== 'success') {
      Taro.showToast({ title: '仅支持播放已完成作品', icon: 'none' })
      return
    }

    const play = async () => {
      try {
        let audioUrl = audioMap[item.id]
        if (!audioUrl) {
          const detail = await getMusicResult(item.id)
          audioUrl = detail.audio_url
          setAudioMap((prev) => ({ ...prev, [item.id]: audioUrl }))
        }

        if (!audioUrl) {
          Taro.showToast({ title: '暂无音频地址', icon: 'none' })
          return
        }

        const result = await toggleAudio(audioUrl)
        setPlayingId(result.playing ? item.id : null)
      } catch (error) {
        setPlayingId(null)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      }
    }

    play()
  }

  const handleMore = (e: any, item: MusicHistoryItem) => {
    e.stopPropagation()
    Taro.showActionSheet({
      itemList: ['删除', '重新生成', '分享'],
      success: async (res) => {
        if (res.tapIndex === 0) {
          try {
            await deleteMusic(item.id)
            setHistory((prev) => prev.filter((record) => record.id !== item.id))
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
        if (res.tapIndex === 1) {
          Taro.showToast({ title: '重新生成开发中', icon: 'none' })
        }
        if (res.tapIndex === 2) {
          Taro.showToast({ title: '分享开发中', icon: 'none' })
        }
      }
    })
  }

  return (
    <View className="history-page">
      <PageHeader title="历史" icon={historyIcon} />
      <ScrollView className="history-scroll" scrollY>
        {/* Filters */}
        <View className="filters-wrap">
          {FILTERS.map((f, i) => (
            <View
              key={f}
              className={`filter-btn ${i === activeFilter ? 'active' : ''}`}
              onClick={() => setActiveFilter(i)}
            >
              <Text>{f}</Text>
            </View>
          ))}
        </View>

        {/* List */}
        <View className="history-list">
          {history.map((item) => (
            <GlassCard
              key={item.id}
              className="history-item"
              padding="none"
              onClick={() => handleItemClick(item)}
            >
              <View className="item-cover">
                {item.cover ? (
                  <Image src={item.cover} mode="aspectFill" className="cover-image" />
                ) : (
                  <View className="cover-placeholder">
                    <Image src={clockIcon} className="cover-icon" mode="aspectFit" />
                  </View>
                )}
                <View className="cover-overlay" />
              </View>

              <View className="item-content">
                <View className="item-header">
                  <Text className={`item-title ${item.status === 'failed' ? 'failed' : ''}`}>
                    {item.title}
                  </Text>
                  {item.status === 'success' && <View className="status-dot success" />}
                  {item.status === 'failed' && <View className="status-dot failed" />}
                </View>
                <Text className="item-date">{formatDate(item.created_at)}</Text>
              </View>

              <View className="item-actions">
                <View className="action-btn play" onClick={(e) => handlePlay(e, item)}>
                  <Image
                    src={playingId === item.id ? pauseIcon : playIcon}
                    className="action-icon"
                    mode="aspectFit"
                  />
                </View>
                <View className="action-btn more" onClick={(e) => handleMore(e, item)}>
                  <Image src={ellipsisIcon} className="action-icon" mode="aspectFit" />
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
