import { View, Text } from '@tarojs/components'
import { PropsWithChildren } from 'react'
import './index.scss'

interface PrimaryButtonProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'ghost'
  disabled?: boolean
  loading?: boolean
  block?: boolean
  onClick?: () => void
}

export default function PrimaryButton({
  children,
  className = '',
  size = 'md',
  variant = 'primary',
  disabled = false,
  loading = false,
  block = false,
  onClick
}: PropsWithChildren<PrimaryButtonProps>) {
  const classNames = [
    'primary-button',
    `primary-button--${size}`,
    `primary-button--${variant}`,
    block && 'primary-button--block',
    disabled && 'primary-button--disabled',
    loading && 'primary-button--loading',
    className
  ].filter(Boolean).join(' ')

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick()
    }
  }

  return (
    <View className={classNames} onClick={handleClick}>
      {loading ? (
        <View className="primary-button__loading">
          <View className="loading-dot" />
          <View className="loading-dot" />
          <View className="loading-dot" />
        </View>
      ) : (
        <Text className="primary-button__text">{children}</Text>
      )}
    </View>
  )
}
