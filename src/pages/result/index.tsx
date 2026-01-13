import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { GlassCard, PrimaryButton } from '../../components'
import { downloadMusic, getMusicResult, getMusicVariants, shareMusic } from '../../services/music'
import type { MusicResult, MusicVariant } from '../../types'
import './index.scss'

const formatDuration = (seconds?: number) => {
  const total = Number.isFinite(seconds) ? Number(seconds) : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

export default function Result() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [music, setMusic] = useState<MusicResult | null>(null)
  const [variants, setVariants] = useState<MusicVariant[]>([])
  const musicId = Taro.getCurrentInstance().router?.params?.music_id

  useEffect(() => {
    if (!musicId) {
      Taro.showToast({ title: '缺少作品ID', icon: 'none' })
      return
    }

    const fetchResult = async () => {
      try {
        const [detail, list] = await Promise.all([
          getMusicResult(musicId),
          getMusicVariants(musicId)
        ])
        setMusic(detail)
        setVariants(list)
      } catch (error) {
        Taro.showToast({ title: '作品加载失败', icon: 'none' })
      }
    }

    fetchResult()
  }, [musicId])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleClose = () => {
    Taro.switchTab({ url: '/pages/discovery/index' })
  }

  const handleDownload = async () => {
    if (!musicId) return

    try {
      const data = await downloadMusic(musicId)
      await Taro.downloadFile({ url: data.download_url })
      Taro.showToast({ title: '已开始下载', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '下载失败', icon: 'none' })
    }
  }

  const handleShare = async () => {
    if (!musicId) return

    try {
      await shareMusic(musicId, { platform: 'weapp', channel: 'session' })
      Taro.showShareMenu({ withShareTicket: true })
    } catch (error) {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }

  const handleCopyPrompt = () => {
    if (!music?.prompt) {
      Taro.showToast({ title: '暂无提示词', icon: 'none' })
      return
    }

    Taro.setClipboardData({
      data: music.prompt,
      success: () => {
        Taro.showToast({ title: '已复制', icon: 'success' })
      }
    })
  }

  return (
    <ScrollView className="result-page" scrollY>
      {/* Gradient Background */}
      <View className="gradient-bg" />

      <View className="result-content">
        {/* Header - 原版 */}
        <View className="result-header">
          <Text className="header-badge">GENERATION COMPLETE</Text>
          <Text className="header-title">你的作品已完成</Text>
          <Text className="header-task-id">作品 ID: {music?.id ?? '--'}</Text>
        </View>

        {/* Hero Card - 原版 */}
        <GlassCard className="hero-card" variant="highlight" padding="none">
          <View className="hero-inner">
            <Image
              src={music?.cover || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=80'}
              mode="aspectFill"
              className="hero-image"
            />
            <View className="hero-overlay" onClick={handlePlay}>
              <View className="play-btn">
                <Text className="play-icon">{isPlaying ? '❚❚' : '▶'}</Text>
              </View>
            </View>

            {/* Player Controls Overlay - 原版 */}
            <View className="player-overlay">
              <View className="track-info">
                <Text className="track-title">{music?.title ?? 'Neon Nights'}</Text>
                <Text className="track-meta">{music?.bpm ?? 120} BPM</Text>
              </View>
              <View className="progress-bar">
                <View className="progress-fill" style={{ width: '33%' }} />
              </View>
              <View className="progress-time">
                <Text>0:00</Text>
                <Text>{formatDuration(music?.duration)}</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* Actions Grid - 原版: 4列 */}
        <View className="actions-grid">
          <View className="action-item" onClick={handleDownload}>
            <Text className="action-icon">↓</Text>
            <Text className="action-label">下载</Text>
          </View>
          <View className="action-item" onClick={handleShare}>
            <Text className="action-icon">↗</Text>
            <Text className="action-label">分享</Text>
          </View>
          <View className="action-item" onClick={handleCopyPrompt}>
            <Text className="action-icon">📋</Text>
            <Text className="action-label">复制Prompt</Text>
          </View>
          <View className="action-item">
            <Text className="action-icon">⋯</Text>
            <Text className="action-label">更多</Text>
          </View>
        </View>

        {/* Variants List - 原版 */}
        <View className="variants-section">
          <Text className="section-title">变体 (Variants)</Text>
          {variants.length ? (
            variants.map((variant) => (
              <GlassCard className="variant-card" key={variant.id}>
                <View className="variant-cover">
                  <Image src={variant.cover} mode="aspectFill" className="variant-image" />
                </View>
                <View className="variant-info">
                  <Text className="variant-title">{variant.title}</Text>
                  <Text className="variant-desc">{formatDuration(variant.duration)}</Text>
                </View>
                <View className="variant-play">
                  <Text>▶</Text>
                </View>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="variant-card">
              <View className="variant-info">
                <Text className="variant-title">暂无变体</Text>
              </View>
            </GlassCard>
          )}
        </View>

        {/* Bottom Actions - 原版 */}
        <View className="bottom-actions">
          <PrimaryButton block onClick={handleClose}>
            完成
          </PrimaryButton>
          <View className="back-link" onClick={handleClose}>
            <Text>返回首页</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
