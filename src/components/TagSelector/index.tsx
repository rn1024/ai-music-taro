import { View, Text, ScrollView } from '@tarojs/components'
import './index.scss'

interface TagSelectorProps {
  tags: string[]
  selectedTags: string[]
  onChange: (tags: string[]) => void
  multiple?: boolean
  maxSelect?: number
  className?: string
}

export default function TagSelector({
  tags,
  selectedTags,
  onChange,
  multiple = true,
  maxSelect = 10,
  className = ''
}: TagSelectorProps) {
  const handleTagClick = (tag: string) => {
    if (multiple) {
      if (selectedTags.includes(tag)) {
        onChange(selectedTags.filter(t => t !== tag))
      } else if (selectedTags.length < maxSelect) {
        onChange([...selectedTags, tag])
      }
    } else {
      onChange(selectedTags.includes(tag) ? [] : [tag])
    }
  }

  return (
    <View className={`tag-selector ${className}`}>
      <ScrollView
        className="tag-selector__scroll"
        scrollX
        scrollWithAnimation
        showScrollbar={false}
      >
        <View className="tag-selector__list">
          {tags.map((tag) => (
            <View
              key={tag}
              className={`tag-selector__tag ${selectedTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagClick(tag)}
            >
              <Text className="tag-selector__text">{tag}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      {multiple && maxSelect > 0 && (
        <View className="tag-selector__count">
          <Text>{selectedTags.length}/{maxSelect}</Text>
        </View>
      )}
    </View>
  )
}
