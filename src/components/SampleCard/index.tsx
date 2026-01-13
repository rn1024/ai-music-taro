import { View, Text, Image } from '@tarojs/components'
import { GlassCard } from '../../components'
import { playIcon, pauseIcon, heartIcon, heartActiveIcon, share2Icon } from '../../assets/icons'
import './index.scss'

export interface MappedSample {
  id: string
  title: string
  author: string
  likes: number
  duration: string
  image: string
  tag: string
  isLiked?: boolean
}

interface SampleCardProps {
  sample: MappedSample
  isPlaying?: boolean
  onPlay?: () => void
  onLike?: () => void
  onShare?: () => void
  onClick?: () => void
}

export default function SampleCard({
  sample,
  isPlaying = false,
  onPlay,
  onLike,
  onShare,
  onClick
}: SampleCardProps) {
  const handlePlay = (e: any) => {
    e.stopPropagation()
    onPlay?.()
  }

  const handleLike = (e: any) => {
    e.stopPropagation()
    onLike?.()
  }

  const handleShare = (e: any) => {
    e.stopPropagation()
    onShare?.()
  }

  return (
    <GlassCard className="sample-card" padding="sm" onClick={onClick}>
      <View className="sample-card__cover" onClick={handlePlay}>
        <Image src={sample.image} mode="aspectFill" className="sample-card__cover-image" />
        <View className={`sample-card__play-overlay ${isPlaying ? 'playing' : ''}`}>
          <Image
            src={isPlaying ? pauseIcon : playIcon}
            className="sample-card__play-icon"
            mode="aspectFit"
          />
        </View>
      </View>

      <View className="sample-card__info">
        <View className="sample-card__info-top">
          <Text className="sample-card__title">{sample.title}</Text>
          <Text className="sample-card__duration">{sample.duration}</Text>
        </View>
        <Text className="sample-card__author">@{sample.author}</Text>
        <View className="sample-card__info-bottom">
          <View className="sample-card__likes" onClick={handleLike}>
            <Image
              src={sample.isLiked ? heartActiveIcon : heartIcon}
              className={`sample-card__heart-icon ${sample.isLiked ? 'liked' : ''}`}
              mode="aspectFit"
            />
            <Text className={`sample-card__likes-count ${sample.isLiked ? 'liked' : ''}`}>
              {sample.likes}
            </Text>
          </View>
          <View className="sample-card__tag">
            <Text>{sample.tag}</Text>
          </View>
        </View>
      </View>

      <View className="sample-card__share" onClick={handleShare}>
        <Image src={share2Icon} className="sample-card__share-icon" mode="aspectFit" />
      </View>
    </GlassCard>
  )
}
