import { View, Text, ScrollView } from '@tarojs/components'
import type { Category } from '../../types'
import './index.scss'

interface CategoryTabsProps {
  categories: Category[]
  activeId: string
  onChange: (id: string) => void
}

export default function CategoryTabs({
  categories,
  activeId,
  onChange
}: CategoryTabsProps) {
  return (
    <ScrollView className="category-tabs" scrollX showScrollbar={false}>
      <View className="category-tabs__list">
        {categories.map((cat) => (
          <View
            key={cat.id}
            className={`category-tabs__item ${cat.id === activeId ? 'active' : ''}`}
            onClick={() => onChange(cat.id)}
          >
            <Text>{cat.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}
