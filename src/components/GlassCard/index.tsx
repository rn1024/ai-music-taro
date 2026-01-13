import { View } from '@tarojs/components'
import { PropsWithChildren } from 'react'
import './index.scss'

interface GlassCardProps {
  className?: string
  variant?: 'default' | 'highlight' | 'active'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  onClick?: () => void
}

export default function GlassCard({
  children,
  className = '',
  variant = 'default',
  padding = 'md',
  onClick
}: PropsWithChildren<GlassCardProps>) {
  const classNames = [
    'glass-card',
    `glass-card--${variant}`,
    `glass-card--padding-${padding}`,
    className
  ].filter(Boolean).join(' ')

  return (
    <View className={classNames} onClick={onClick}>
      {children}
    </View>
  )
}
