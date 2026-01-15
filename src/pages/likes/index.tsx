import Taro, { usePullDownRefresh, useReachBottom } from '@tarojs/taro'
import { ScrollView, Text as TaroText, View } from '@tarojs/components'
import { useCallback, useEffect, useState } from 'react'
import SampleCard, { type MappedSample } from '../../components/SampleCard'
import { getUserLikes } from '../../services/user'
import { toggleSampleLike } from '../../services/discovery'
import { shareMusic } from '../../services/music'
import type { UserLikeItem } from '../../types/api'
import './index.scss'

const PAGE_SIZE = 20

const formatDuration = (seconds?: number) => {
  const total = Number.isFinite(seconds) ? Number(seconds) : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

const mapLike = (item: UserLikeItem): MappedSample | null => {
  if (!item.sample) return null
  return {
    id: item.sample.id,
    title: item.sample.title,
    author: item.sample.author,
    likes: item.sample.likes,
    duration: formatDuration(item.sample.duration),
    image: item.sample.cover,
    tag: item.sample.tag || '热门',
    isLiked: true
  }
}

export default function Likes() {
  const [list, setList] = useState<MappedSample[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    hasMore: true
  })
  const [loadingMore, setLoadingMore] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)

  const fetchLikes = useCallback(async (isLoadMore = false) => {
    const page = isLoadMore ? pagination.page + 1 : 1

    try {
      const data = await getUserLikes({ page, perPage: PAGE_SIZE })
      const mapped = data.list.map(mapLike).filter(Boolean) as MappedSample[]

      setList((prev) => (isLoadMore ? [...prev, ...mapped] : mapped))
      setPagination({
        page: data.meta.currentPage,
        hasMore: data.meta.next !== null
      })
    } catch (error) {
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' })
    }
  }, [pagination.page])

  useEffect(() => {
    fetchLikes()
  }, [])

  usePullDownRefresh(async () => {
    await fetchLikes()
    Taro.stopPullDownRefresh()
  })

  useReachBottom(async () => {
    if (!pagination.hasMore || loadingMore) return
    setLoadingMore(true)
    await fetchLikes(true)
    setLoadingMore(false)
  })

  const handlePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id))
  }

  const handleLike = async (id: string) => {
    try {
      const result = await toggleSampleLike(id)
      setList((prev) => {
        if (!result.liked) {
          return prev.filter((item) => item.id !== id)
        }
        return prev.map((item) =>
          item.id === id ? { ...item, isLiked: result.liked, likes: result.likes } : item
        )
      })
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const handleShare = async (id: string) => {
    try {
      await shareMusic(id, { platform: 'weapp', channel: 'session' })
      Taro.showShareMenu({ withShareTicket: true })
    } catch (error) {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }

  const handleCardClick = (id: string) => {
    Taro.navigateTo({ url: `/pages/result/index?music_id=${id}` })
  }

  return (
    <View className="likes-page">
      <ScrollView className="likes-scroll" scrollY>
        {list.length === 0 ? (
          <View className="empty-state">
            <TaroText>暂无点赞记录</TaroText>
          </View>
        ) : (
          <View className="likes-list">
            {list.map((item) => (
              <SampleCard
                key={item.id}
                sample={item}
                isPlaying={playingId === item.id}
                onPlay={() => handlePlay(item.id)}
                onLike={() => handleLike(item.id)}
                onShare={() => handleShare(item.id)}
                onClick={() => handleCardClick(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  )
}
