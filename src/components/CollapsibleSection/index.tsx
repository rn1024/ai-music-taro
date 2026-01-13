import { View, Text, Image } from '@tarojs/components'
import { chevronRightIcon } from '../../assets/icons'
import { useState, PropsWithChildren } from 'react'
import './index.scss'

interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  defaultExpanded?: boolean
  className?: string
}

export default function CollapsibleSection({
  title,
  subtitle,
  defaultExpanded = true,
  className = '',
  children
}: PropsWithChildren<CollapsibleSectionProps>) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  return (
    <View className={`collapsible-section ${className}`}>
      <View
        className="collapsible-section__header"
        onClick={() => setExpanded(!expanded)}
      >
        <View className="collapsible-section__title-wrap">
          <Text className="collapsible-section__title">{title}</Text>
          {subtitle && (
            <Text className="collapsible-section__subtitle">{subtitle}</Text>
          )}
        </View>
        <Image
          src={chevronRightIcon}
          className={`collapsible-section__arrow ${expanded ? 'expanded' : ''}`}
          mode="aspectFit"
        />
      </View>

      <View className={`collapsible-section__content ${expanded ? 'expanded' : ''}`}>
        <View className="collapsible-section__inner">
          {children}
        </View>
      </View>
    </View>
  )
}
