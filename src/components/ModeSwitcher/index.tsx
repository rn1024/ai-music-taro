import { View, Text } from '@tarojs/components'
import type { CreateMode } from '../../types'
import './index.scss'

interface ModeSwitcherProps {
  value: CreateMode
  onChange: (mode: CreateMode) => void
  className?: string
}

export default function ModeSwitcher({
  value,
  onChange,
  className = ''
}: ModeSwitcherProps) {
  return (
    <View className={`mode-switcher ${className}`}>
      <View
        className={`mode-switcher__tab ${value === 'basic' ? 'active' : ''}`}
        onClick={() => onChange('basic')}
      >
        <Text className="mode-switcher__label">简易模式</Text>
      </View>
      <View
        className={`mode-switcher__tab ${value === 'pro' ? 'active' : ''}`}
        onClick={() => onChange('pro')}
      >
        <Text className="mode-switcher__label">专业模式</Text>
        <View className="mode-switcher__badge">
          <Text>PRO</Text>
        </View>
      </View>
    </View>
  )
}
