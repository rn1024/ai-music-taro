import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useShareAppMessage, useShareTimeline } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { GlassCard, PrimaryButton } from '../../components'
import LyricsOverlay from '../../components/LyricsOverlay'
import { downloadMusic, getMusicLyrics, getMusicResult, getMusicVariants, shareMusic } from '../../services/music'
import { checkFavorite, toggleFavorite } from '../../services/favorites'
import type { MusicResult, MusicVariant, LyricWord } from '../../types'
import {
  playIcon,
  pauseIcon,
  downloadIcon,
  share2Icon,
  copyIcon,
  saveIcon,
  saveActiveIcon,
  chevronRightActiveIcon
} from '../../assets/icons'
import { getAudioContext, getAudioState, toggleAudio } from '../../utils/audio'
import './index.scss'

const formatDuration = (seconds?: number) => {
  const total = Number.isFinite(seconds) ? Number(seconds) : 0
  const minutes = Math.floor(total / 60)
  const remain = String(Math.floor(total % 60)).padStart(2, '0')
  return `${minutes}:${remain}`
}

export default function Result() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [music, setMusic] = useState<MusicResult | null>(null)
  const [variants, setVariants] = useState<MusicVariant[]>([])
  const [topBarStyle, setTopBarStyle] = useState<{ paddingTop: string; height: string } | null>(null)
  const [lyrics, setLyrics] = useState<LyricWord[]>([])
  const [showLyricsOverlay, setShowLyricsOverlay] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const musicId = Taro.getCurrentInstance().router?.params?.music_id
  const isPreview = Taro.getCurrentInstance().router?.params?.preview === '1'
  const isWeapp = Taro.getEnv() === Taro.ENV_TYPE.WEAPP

  // 同步全局音频播放状态（从历史列表进入时可能已在播放）
  useEffect(() => {
    try {
      const audioState = getAudioState()
      if (audioState.isPlaying) {
        setIsPlaying(true)
      }
    } catch {
      // ignore
    }
  }, [])

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
    const handlePlay = () => setIsPlaying(true)
    const handleStop = () => setIsPlaying(false)
    const handleError = () => {
      setIsPlaying(false)
      Taro.showToast({ title: '播放失败', icon: 'none' })
    }

    audio.onPlay(handlePlay)
    audio.onEnded(handleStop)
    audio.onStop(handleStop)
    audio.onPause(handleStop)
    audio.onError(handleError)

    return () => {
      audio.offPlay(handlePlay)
      audio.offEnded(handleStop)
      audio.offStop(handleStop)
      audio.offPause(handleStop)
      audio.offError(handleError)
    }
  }, [])

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

    const handleTimeUpdate = () => {
      if (audio?.currentTime) {
        setCurrentTime(audio.currentTime)
      }
    }

    audio.onTimeUpdate?.(handleTimeUpdate)

    return () => {
      audio.offTimeUpdate?.(handleTimeUpdate)
    }
  }, [])

  useEffect(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      return
    }

    try {
      const info = Taro.getSystemInfoSync()
      const menu = Taro.getMenuButtonBoundingClientRect?.()
      const statusBarHeight = info.statusBarHeight ?? 0
      const top = menu?.top ?? statusBarHeight
      const height = menu?.height ?? 32
      const extra = 12
      setTopBarStyle({
        paddingTop: `${top}px`,
        height: `${top + height + extra}px`
      })
    } catch {
      setTopBarStyle(null)
    }
  }, [])

  useEffect(() => {
    if (!musicId) {
      Taro.showToast({ title: '缺少作品ID', icon: 'none' })
      return
    }

    const fetchResult = async () => {
      try {
        const [detail, list, favoriteStatus] = await Promise.all([
          getMusicResult(musicId),
          getMusicVariants(musicId),
          checkFavorite({ target_type: 'music', target_id: musicId })
        ])
        setMusic(detail)
        setVariants(list)
        setIsFavorited(favoriteStatus.favorited)
      } catch (error) {
        Taro.showToast({ title: '作品加载失败', icon: 'none' })
      }
    }

    fetchResult()
    loadLyrics(musicId)
  }, [musicId])

  useShareAppMessage(() => {
    if (!musicId) {
      return { title: 'AI Music', path: '/pages/discovery/index' }
    }
    shareMusic(musicId, { platform: 'weapp', channel: 'session' }).catch(() => undefined)
    const title = music?.title ? `${music.title} · AI Music` : 'AI Music'
    const path = `/pages/result/index?music_id=${musicId}`
    return music?.cover ? { title, path, imageUrl: music.cover } : { title, path }
  })

  useShareTimeline(() => {
    if (!musicId) {
      return { title: 'AI Music' }
    }
    shareMusic(musicId, { platform: 'weapp', channel: 'timeline' }).catch(() => undefined)
    const title = music?.title ? `${music.title} · AI Music` : 'AI Music'
    const query = `music_id=${musicId}`
    return music?.cover ? { title, query, imageUrl: music.cover } : { title, query }
  })

  const handlePlay = () => {
    const play = async () => {
      try {
        if (!music?.audio_url) {
          Taro.showToast({ title: '暂无音频地址', icon: 'none' })
          return
        }
        const result = await toggleAudio(music.audio_url)
        setIsPlaying(result.playing)
      } catch (error) {
        setIsPlaying(false)
        Taro.showToast({ title: '播放失败', icon: 'none' })
      }
    }

    play()
  }

  const handleClose = () => {
    Taro.switchTab({ url: '/pages/discovery/index' })
  }

  const handleBack = () => {
    Taro.navigateBack({
      delta: 1,
      fail: () => {
        Taro.switchTab({ url: '/pages/discovery/index' })
      }
    })
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
      if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
        Taro.showShareMenu({ withShareTicket: true })
      } else {
        Taro.showToast({ title: '分享成功', icon: 'success' })
      }
    } catch (error) {
      Taro.showToast({ title: '分享失败', icon: 'none' })
    }
  }

  const handleFavorite = async () => {
    if (!musicId) return

    try {
      const result = await toggleFavorite({ target_type: 'music', target_id: musicId })
      setIsFavorited(result.favorited)
      Taro.showToast({ title: result.favorited ? '已收藏' : '已取消', icon: 'none' })
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  const loadLyrics = async (musicId: string) => {
    try {
      const data = await getMusicLyrics(musicId)
      if (data.lyrics && data.lyrics.length > 0) {
        const lyricsData = data.lyrics[0]
        setLyrics(lyricsData.words)
        setShowLyricsOverlay(!lyricsData.isInstrumental)
      } else {
        setLyrics([])
        setShowLyricsOverlay(false)
      }
    } catch (error) {
      setLyrics([])
      setShowLyricsOverlay(false)
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
    <View className="result-root">
      <View className="result-top-bar" style={topBarStyle ?? undefined}>
        <View className="top-bar-action" onClick={handleBack}>
          <Image src={chevronRightActiveIcon} className="top-bar-icon" mode="aspectFit" />
        </View>
      </View>

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
                 <Image src={isPlaying ? pauseIcon : playIcon} className="play-icon" mode="aspectFit" />
               </View>
             </View>

             {/* Lyrics Overlay */}
             {showLyricsOverlay && (
               <LyricsOverlay
                 lyrics={lyrics}
                 currentTime={currentTime}
                 isVisible={isPlaying}
               />
             )}

             {/* Player Controls Overlay - 原版 */}
             <View className="player-overlay">
               <View className="track-info">
                 <View className="track-title-row">
                   <Text className="track-title">{music?.title ?? 'Neon Nights'}</Text>
                   {isPlaying && (
                     <View className="spinning-disc">
                       <View className="disc-inner" />
                     </View>
                   )}
                 </View>
                 <Text className="track-meta">{music?.bpm ?? 120} BPM</Text>
               </View>
               <View className="progress-bar">
                 <View
                   className="progress-fill"
                   style={{ width: `${music?.duration ? (currentTime / music.duration) * 100 : 0}%` }}
                 />
               </View>
               <View className="progress-time">
                 <Text>{formatDuration(currentTime)}</Text>
                 <Text>{formatDuration(music?.duration)}</Text>
               </View>
             </View>
           </View>
         </GlassCard>

        {/* Actions Grid - 原版: 4列 */}
        <View className="actions-grid">
          <View className="action-item" onClick={handleDownload}>
            <Image src={downloadIcon} className="action-icon" mode="aspectFit" />
            <Text className="action-label">下载</Text>
          </View>
          {isWeapp ? (
            <Button className="action-item action-button" openType="share">
              <Image src={share2Icon} className="action-icon" mode="aspectFit" />
              <Text className="action-label">分享</Text>
            </Button>
          ) : (
            <View className="action-item" onClick={handleShare}>
              <Image src={share2Icon} className="action-icon" mode="aspectFit" />
              <Text className="action-label">分享</Text>
            </View>
          )}
          <View className="action-item" onClick={handleCopyPrompt}>
            <Image src={copyIcon} className="action-icon" mode="aspectFit" />
            <Text className="action-label">复制Prompt</Text>
          </View>
          <View className="action-item" onClick={handleFavorite}>
            <Image
              src={isFavorited ? saveActiveIcon : saveIcon}
              className="action-icon"
              mode="aspectFit"
            />
            <Text className="action-label">收藏</Text>
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
                  <Image src={playIcon} className="variant-play-icon" mode="aspectFit" />
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
        {isPreview ? (
          <View className="bottom-actions">
            <PrimaryButton block onClick={handleClose}>
              完成
            </PrimaryButton>
            <View className="back-link" onClick={handleClose}>
              <Text>返回首页</Text>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  </View>
  )
}
