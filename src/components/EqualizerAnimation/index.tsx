import { View } from '@tarojs/components'
import './index.scss'

interface EqualizerAnimationProps {
  playing?: boolean
  barCount?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function EqualizerAnimation({
  playing = true,
  barCount = 5,
  size = 'md',
  className = ''
}: EqualizerAnimationProps) {
  return (
    <View className={`equalizer ${playing ? 'playing' : ''} equalizer--${size} ${className}`}>
      {Array.from({ length: barCount }).map((_, index) => (
        <View
          key={index}
          className="equalizer__bar"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
      ))}
    </View>
  )
}
