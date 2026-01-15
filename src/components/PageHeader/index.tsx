import { View, Text, Image } from '@tarojs/components'
import type { CSSProperties } from 'react'
import { useMemo } from 'react'
import { useNavLayout } from '../../hooks/useNavLayout'
import './index.scss'

type PageHeaderProps = {
  title: string
  icon?: string
  onIconClick?: () => void
}

export default function PageHeader({ title, icon, onIconClick }: PageHeaderProps) {
  const navStyle = useNavLayout()
  const headerStyle = useMemo(() => navStyle as CSSProperties | undefined, [navStyle])

  return (
    <View className="page-header" style={headerStyle}>
      <View className="page-header__title-group">
        {icon ? (
          <View className="page-header__icon-inline" onClick={onIconClick}>
            <Image src={icon} className="page-header__icon" mode="aspectFit" />
          </View>
        ) : null}
        <Text className="page-header__title">{title}</Text>
      </View>
    </View>
  )
}
