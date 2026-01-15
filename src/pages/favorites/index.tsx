import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { Image as TaroImage, ScrollView, Text as TaroText, View } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import { GlassCard } from '../../components'
import { toggleFavorite, getFavorites } from '../../services/favorites'
import type { FavoriteItem } from '../../types/api'
import { saveActiveIcon } from '../../assets/icons'
import './index.scss'

const PAGE_SIZE = 20

const FILTER_OPTIONS = [
  { label: '全部', value: 'all' },
  { label: '我的作品', value: 'music' },
  { label: '热门音乐', value: 'sample' }
] as const

type FilterType = (typeof FILTER_OPTIONS)[number]['value']

const formatDuration = (seconds?: number) => {
  const total = Number.isFinite(seconds) ? Number(seconds) : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

export default function Favorites() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [list, setList] = useState<FavoriteItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true
  })
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchFavorites = useCallback(async (isLoadMore = false) => {
    const page = isLoadMore ? pagination.page + 1 : 1
    try {
      const data = await getFavorites({
        page,
        perPage: PAGE_SIZE,
        type: filter === 'all' ? undefined : filter
      })

      setList((prev) => (isLoadMore ? [...prev, ...data.list] : data.list))
      setPagination({
        page: data.meta.currentPage,
        hasMore: data.meta.next !== null
      })
    } catch (error) {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  }, [filter, pagination.page])

  useEffect(() => {
    fetchFavorites()
  }, [filter])

  usePullDownRefresh(async () => {
    await fetchFavorites()
    Taro.stopPullDownRefresh()
  })

  useReachBottom(async () => {
    if (!pagination.hasMore || loadingMore) return
    setLoadingMore(true)
    await fetchFavorites(true)
    setLoadingMore(false)
  })

  const handleToggle = async (item: FavoriteItem) => {
    try {
      const result = await toggleFavorite({
        target_type: item.target_type,
        target_id: item.target_id
      })
      if (!result.favorited) {
        setList((prev) => prev.filter((fav) => fav.id !== item.id))
      }
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleCardClick = (item: FavoriteItem) => {
    if (item.target_type === 'music') {
      Taro.navigateTo({ url: `/pages/result/index?music_id=${item.target_id}` })
    } else {
      Taro.navigateTo({ url: `/pages/result/index?music_id=${item.target_id}` })
    }
  }

  return (
    <View className="favorites-page">
      <View className="favorites-filter">
        {FILTER_OPTIONS.map((option) => (
          <View
            key={option.value}
            className={`filter-item ${filter === option.value ? 'active' : ''}`}
            onClick={() => setFilter(option.value)}
          >
            <TaroText>{option.label}</TaroText>
          </View>
        ))}
      </View>
      <ScrollView className="favorites-scroll" scrollY>
        {list.length === 0 ? (
          <View className="empty-state">
            <TaroText>暂无收藏</TaroText>
          </View>
        ) : (
          <View className="favorites-list">
            {list.map((item) => {
              const target = item.target
              const title = target?.title || '未命名'
              const cover = target?.cover || ''
              const duration = formatDuration(target?.duration)
              const subtitle =
                item.target_type === 'music'
                  ? '我的作品'
                  : target && 'author' in target
                    ? target.author
                    : '热门音乐'

              return (
                <GlassCard
                  key={item.id}
                  className="favorite-card"
                  padding="none"
                  onClick={() => handleCardClick(item)}
                >
                  <View className="favorite-cover">
                    {cover ? (
                      <TaroImage src={cover} mode="aspectFill" className="cover-image" />
                    ) : (
                      <View className="cover-placeholder" />
                    )}
                  </View>
                  <View className="favorite-info">
                    <TaroText className="favorite-title">{title}</TaroText>
                    <TaroText className="favorite-subtitle">{subtitle}</TaroText>
                    <TaroText className="favorite-duration">{duration}</TaroText>
                  </View>
                  <View className="favorite-action" onClick={(e: { stopPropagation: () => void }) => {
                    e.stopPropagation()
                    handleToggle(item)
                  }}>
                    <TaroImage src={saveActiveIcon} className="favorite-icon" mode="aspectFit" />
                  </View>
                </GlassCard>
              )
            })}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
