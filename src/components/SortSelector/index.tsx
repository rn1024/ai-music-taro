import { View, Text } from '@tarojs/components'
import './index.scss'

export type SortType = 'hot' | 'latest' | 'likes'

export interface SortOption {
  id: SortType
  label: string
}

interface SortSelectorProps {
  options: SortOption[]
  activeSort: SortType
  onChange: (sort: SortType) => void
}

export default function SortSelector({
  options,
  activeSort,
  onChange
}: SortSelectorProps) {
  return (
    <View className="sort-selector">
      <Text className="sort-selector__label">排序:</Text>
      <View className="sort-selector__options">
        {options.map((option) => (
          <View
            key={option.id}
            className={`sort-selector__item ${option.id === activeSort ? 'active' : ''}`}
            onClick={() => onChange(option.id)}
          >
            <Text>{option.label}</Text>
          </View>
        ))}
      </View>
    </View>
  )
}
