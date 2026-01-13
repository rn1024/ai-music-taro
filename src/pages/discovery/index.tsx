import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { GlassCard } from '../../components'
import { getCategories, getHotSamples } from '../../services/discovery'
import { shareMusic } from '../../services/music'
import type { Category, HotSample } from '../../types'
import { sparklesIcon, musicIcon, trendingUpIcon, playIcon, heartIcon, share2Icon } from '../../assets/icons'
import './index.scss'

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: '全部' },
  { id: 'pop', name: '流行' },
  { id: 'electronic', name: '电子' },
  { id: 'jazz', name: '爵士' },
  { id: 'lofi', name: 'Lo-Fi' },
  { id: 'rock', name: '摇滚' },
  { id: 'classical', name: '古典' }
]

const FALLBACK_SAMPLES = [
  {
    id: 'local_1',
    title: 'Neon Cyber City',
    author: 'Alex.AI',
    likes: 1240,
    duration: 105,
    cover: 'https://images.unsplash.com/photo-1705510144116-cc4d88838b14?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400',
    tag: 'Electronic'
  }
]

const formatDuration = (seconds: number) => {
  const total = Number.isFinite(seconds) ? seconds : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

const mapSample = (sample: HotSample) => ({
  id: sample.id,
  title: sample.title,
  author: sample.author,
  likes: sample.likes,
  duration: formatDuration(sample.duration),
  image: sample.cover,
  tag: sample.tag
})

export default function Discovery() {
  const [activeCategory, setActiveCategory] = useState(0)
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [samples, setSamples] = useState(FALLBACK_SAMPLES.map(mapSample))

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories()
        if (data.length) {
          setCategories([{ id: 'all', name: '全部' }, ...data.filter((item) => item.id !== 'all')])
        }
      } catch (error) {
        Taro.showToast({ title: '分类加载失败', icon: 'none' })
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchSamples = async () => {
      const category = categories[activeCategory]?.id ?? 'all'

      try {
        const data = await getHotSamples({ page: 1, perPage: 10, category })
        setSamples(data.list.map(mapSample))
      } catch (error) {
        Taro.showToast({ title: '热门作品加载失败', icon: 'none' })
      }
    }

    fetchSamples()
  }, [activeCategory, categories])

  const handleNavigateToCreate = () => {
    Taro.switchTab({ url: '/pages/create/index' })
  }

  const handleShare = async (id: string) => {
    try {
      await shareMusic(id, { platform: 'weapp', channel: 'session' })
      Taro.showShareMenu({ withShareTicket: true })
    } catch (error) {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }

  return (
    <ScrollView className="discovery-page" scrollY>
      {/* Header - 完全按原版 */}
      <View className="discovery-header">
        <Text className="header-title">发现</Text>
        <View className="header-icon-wrap">
          <Image src={sparklesIcon} className="header-icon" mode="aspectFit" />
        </View>
      </View>

      {/* Banner - 完全按原版 */}
      <View className="banner-section">
        <View className="banner-card">
          <Image
            src="https://images.unsplash.com/photo-1643388019948-0df7123b6aab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
            mode="aspectFill"
            className="banner-image"
          />
          <View className="banner-gradient" />
          <View className="banner-content">
            <View className="banner-badge">
              <Text>本周精选</Text>
            </View>
            <Text className="banner-title">AI 音乐创作挑战赛</Text>
            <Text className="banner-desc">使用 "Cyberpunk" 风格创作，赢取 Pro 会员</Text>
            <View className="banner-btn" onClick={handleNavigateToCreate}>
              <Image src={musicIcon} className="btn-icon" mode="aspectFit" />
              <Text className="btn-text">立即参与</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Categories - 完全按原版 */}
      <View className="categories-section">
        <View className="section-header">
          <Text className="section-title">风格分类</Text>
        </View>
        <ScrollView className="categories-scroll" scrollX showScrollbar={false}>
          <View className="categories-list">
            {categories.map((cat, index) => (
              <View
                key={cat.id}
                className={`category-item ${index === activeCategory ? 'active' : ''}`}
                onClick={() => setActiveCategory(index)}
              >
                <Text>{cat.name}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Hot Samples - 完全按原版 */}
      <View className="samples-section">
        <View className="section-header">
          <View className="section-title-wrap">
            <Image src={trendingUpIcon} className="trending-icon" mode="aspectFit" />
            <Text className="section-title">热门作品</Text>
          </View>
          <View className="view-more">
            <Text>查看更多</Text>
            <Text className="arrow">›</Text>
          </View>
        </View>

        <View className="samples-list">
          {samples.map((sample) => (
            <GlassCard key={sample.id} className="sample-card" padding="sm">
              {/* 封面 */}
              <View className="sample-cover">
                <Image src={sample.image} mode="aspectFill" className="cover-image" />
                <View className="play-overlay">
                  <Image src={playIcon} className="play-icon" mode="aspectFit" />
                </View>
              </View>

              {/* 信息 */}
              <View className="sample-info">
                <View className="info-top">
                  <Text className="sample-title">{sample.title}</Text>
                  <Text className="sample-duration">{sample.duration}</Text>
                </View>
                <Text className="sample-author">@{sample.author}</Text>
                <View className="info-bottom">
                  <View className="sample-likes">
                    <Image src={heartIcon} className="heart-icon" mode="aspectFit" />
                    <Text className="likes-count">{sample.likes}</Text>
                  </View>
                  <View className="sample-tag">
                    <Text>{sample.tag}</Text>
                  </View>
                </View>
              </View>

              {/* 分享按钮 */}
              <View className="share-btn" onClick={() => handleShare(sample.id)}>
                <Image src={share2Icon} className="share-icon" mode="aspectFit" />
              </View>
            </GlassCard>
          ))}
        </View>
      </View>
    </ScrollView>
  )
}
