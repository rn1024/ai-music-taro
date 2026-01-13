import { View, Input, Image } from '@tarojs/components'
import { searchIcon, xIcon } from '../../assets/icons'
import './index.scss'

interface SearchBarProps {
  value: string
  placeholder?: string
  onInput: (value: string) => void
  onClear?: () => void
  onSearch?: (value: string) => void
}

export default function SearchBar({
  value,
  placeholder = '搜索...',
  onInput,
  onClear,
  onSearch
}: SearchBarProps) {
  const handleInput = (e: any) => {
    onInput(e.detail.value)
  }

  const handleClear = () => {
    onInput('')
    onClear?.()
  }

  const handleConfirm = () => {
    onSearch?.(value)
  }

  return (
    <View className="search-bar">
      <Image src={searchIcon} className="search-bar__icon" mode="aspectFit" />
      <Input
        type="text"
        placeholder={placeholder}
        placeholderStyle="color: rgba(255, 255, 255, 0.3)"
        className="search-bar__input"
        value={value}
        onInput={handleInput}
        onConfirm={handleConfirm}
        confirmType="search"
      />
      {value && (
        <View className="search-bar__clear" onClick={handleClear}>
          <Image src={xIcon} className="search-bar__clear-icon" mode="aspectFit" />
        </View>
      )}
    </View>
  )
}
