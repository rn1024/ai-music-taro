import { View, Text, ScrollView, Input, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { GlassCard } from '../../components'
import { deleteMusic, getMusicHistory } from '../../services/music'
import type { MusicHistoryItem } from '../../types'
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
  const [searchText, setSearchText] = useState('')
  const [history, setHistory] = useState<MusicHistoryItem[]>([])

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

  const filteredHistory = useMemo(() => {
    if (!searchText.trim()) return history
    const keyword = searchText.trim().toLowerCase()
    return history.filter((item) => item.title.toLowerCase().includes(keyword))
  }, [history, searchText])

  const handleItemClick = (item: MusicHistoryItem) => {
    if (item.status === 'success') {
      Taro.navigateTo({ url: `/pages/result/index?music_id=${item.id}` })
    }
  }

  const handlePlay = (e: any, item: MusicHistoryItem) => {
    e.stopPropagation()
    Taro.showToast({ title: `播放: ${item.title}`, icon: 'none' })
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
      <ScrollView className="history-scroll" scrollY>
        {/* Search Bar */}
        <View className="search-bar">
          <Text className="search-icon">🔍</Text>
          <Input
            type="text"
            placeholder="搜索历史记录..."
            placeholderClass="placeholder"
            className="search-input"
            value={searchText}
            onInput={(e) => setSearchText(e.detail.value)}
          />
        </View>

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
          {filteredHistory.map((item) => (
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
                    <Text className="cover-icon">🕐</Text>
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
                  <Text>▶</Text>
                </View>
                <View className="action-btn more" onClick={(e) => handleMore(e, item)}>
                  <Text>⋯</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </View>
  )
}
