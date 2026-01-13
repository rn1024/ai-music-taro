import { View, Text } from '@tarojs/components'
import Taro, { useRouter, usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { useState, useEffect, useCallback } from 'react'
import { SearchBar, CategoryTabs, SortSelector, SampleCard } from '../../components'
import { getCategories, getHotSamples, toggleSampleLike } from '../../services/discovery'
import { shareMusic } from '../../services/music'
import type { Category, HotSample } from '../../types'
import type { SortType, MappedSample, SortOption, FilterParams } from './types'
import './index.scss'

const SORT_OPTIONS: SortOption[] = [
  { id: 'hot', label: '最热' },
  { id: 'latest', label: '最新' },
  { id: 'likes', label: '最多点赞' }
]

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'pop', name: '流行' },
  { id: 'electronic', name: '电子' },
  { id: 'jazz', name: '爵士' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'rock', name: '摇滚' },
  { id: 'classical', name: '古典' }
]

const PAGE_SIZE = 20
const SEARCH_DEBOUNCE = 300

const formatDuration = (seconds: number) => {
  const total = Number.isFinite(seconds) ? seconds : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

export default function HotSamples() {
  const router = useRouter()

  const [samples, setSamples] = useState<MappedSample[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    hasMore: true
  })
  const [filters, setFilters] = useState<FilterParams>({
    category: router.params.category || 'all',
    sort: 'hot',
    keyword: ''
  })

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const mapSample = useCallback((sample: HotSample): MappedSample => ({
    id: sample.id,
    title: sample.title,
    author: sample.author,
    likes: sample.likes,
    duration: formatDuration(sample.duration),
    image: sample.cover,
    tag: sample.tag,
    isLiked: (sample as any).isLiked
  }), [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        if (data.length) {
          setCategories([{ id: 'all', name: '全部' }, ...data.filter((item) => item.id !== 'all')])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      }
    }
    fetchCategories()
  }, [])

  const fetchSamples = useCallback(async (isLoadMore = false) => {
    const page = isLoadMore ? pagination.page + 1 : 1

    try {
      const data = await getHotSamples({
        page,
        perPage: PAGE_SIZE,
        category: filters.category === 'all' ? undefined : filters.category,
        sort: filters.sort,
        keyword: filters.keyword || undefined
      })

      const mappedList = data.list.map(mapSample)

      if (isLoadMore) {
        setSamples((prev) => [...prev, ...mappedList])
      } else {
        setSamples(mappedList)
      }

      setPagination({
        page: data.meta.currentPage,
        total: data.meta.total,
        hasMore: data.meta.next !== null
      })
    } catch (error) {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  }, [filters, pagination.page, mapSample])

  useEffect(() => {
    setLoading(true)
    fetchSamples().finally(() => setLoading(false))
  }, [filters.category, filters.sort])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(true)
      fetchSamples().finally(() => setLoading(false))
    }, SEARCH_DEBOUNCE)

    return () => clearTimeout(timer)
  }, [filters.keyword])

  usePullDownRefresh(async () => {
    await fetchSamples()
    Taro.stopPullDownRefresh()
  })

  useReachBottom(async () => {
    if (!pagination.hasMore || loadingMore) return

    setLoadingMore(true)
    await fetchSamples(true)
    setLoadingMore(false)
  })

  const handleSearchInput = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, keyword: value }))
  }, [])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }))
  }, [])

  const handleSortChange = useCallback((sort: SortType) => {
    setFilters((prev) => ({ ...prev, sort }))
  }, [])

  const handlePlay = useCallback((sampleId: string) => {
    setPlayingId((prev) => (prev === sampleId ? null : sampleId))
  }, [])

  const handleLike = useCallback(async (sampleId: string) => {
    try {
      const result = await toggleSampleLike(sampleId)
      setSamples((prev) =>
        prev.map((s) =>
          s.id === sampleId ? { ...s, isLiked: result.liked, likes: result.likes } : s
        )
      )
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }, [])

  const handleShare = useCallback(async (sampleId: string) => {
    try {
      await shareMusic(sampleId, { platform: 'weapp', channel: 'session' })
      Taro.showShareMenu({ withShareTicket: true })
    } catch (error) {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }, [])

  const handleCardClick = useCallback((sampleId: string) => {
    Taro.navigateTo({
      url: `/pages/result/index?music_id=${sampleId}`
    })
  }, [])

  return (
    <View className="hot-samples-page">
      <View className="search-section">
        <SearchBar
          value={filters.keyword}
          placeholder="搜索作品、作者..."
          onInput={handleSearchInput}
          onClear={() => handleSearchInput('')}
        />
      </View>

      <View className="filter-section">
        <CategoryTabs
          categories={categories}
          activeId={filters.category}
          onChange={handleCategoryChange}
        />
        <SortSelector
          options={SORT_OPTIONS}
          activeSort={filters.sort}
          onChange={handleSortChange}
        />
      </View>

      <View className="stats-section">
        <Text className="stats-text">共 {pagination.total.toLocaleString()} 首作品</Text>
      </View>

      <View className="list-section">
        {loading ? (
          <View className="skeleton-list">
            {[1, 2, 3, 4, 5].map((i) => (
              <View key={i} className="skeleton-card" />
            ))}
          </View>
        ) : samples.length === 0 ? (
          <View className="empty-state">
            <View className="empty-icon" />
            <Text className="empty-text">
              {filters.keyword ? '未找到相关作品' : '暂无热门作品'}
            </Text>
            <Text className="empty-hint">
              {filters.keyword ? '换个关键词试试' : '稍后再来看看吧'}
            </Text>
          </View>
        ) : (
          <>
            {samples.map((sample) => (
              <SampleCard
                key={sample.id}
                sample={sample}
                isPlaying={playingId === sample.id}
                onPlay={() => handlePlay(sample.id)}
                onLike={() => handleLike(sample.id)}
                onShare={() => handleShare(sample.id)}
                onClick={() => handleCardClick(sample.id)}
              />
            ))}

            <View className="list-footer">
              {loadingMore ? (
                <Text className="loading-text">加载中...</Text>
              ) : !pagination.hasMore && samples.length > 0 ? (
                <Text className="end-text">- 已经到底了 -</Text>
              ) : null}
            </View>
          </>
        )}
      </View>

      <View className="safe-area-bottom" />
    </View>
  )
}
