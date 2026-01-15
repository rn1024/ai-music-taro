import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

const DEFAULT_PADDING = {
  left: 48,
  right: 48,
  top: 0,
  bottom: 16
}

const toPx = (value: number, windowWidth: number) => (windowWidth / 750) * value

export const useNavLayout = (padding = DEFAULT_PADDING) => {
  const [style, setStyle] = useState<CSSProperties | null>(null)

  useEffect(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      return
    }

    try {
      const info = Taro.getSystemInfoSync()
      const menu = Taro.getMenuButtonBoundingClientRect?.()
      const windowWidth = info.windowWidth || 375
      const top = menu?.top ?? info.statusBarHeight ?? 0
      const height = menu?.height ?? 32
      const rightInset = menu ? windowWidth - menu.left : 0

      setStyle({
        paddingTop: `${top + toPx(padding.top, windowWidth)}px`,
        paddingRight: `${rightInset + toPx(padding.right, windowWidth)}px`,
        paddingBottom: `${toPx(padding.bottom, windowWidth)}px`,
        paddingLeft: `${toPx(padding.left, windowWidth)}px`,
        minHeight: `${height}px`
      })
    } catch {
      setStyle(null)
    }
  }, [padding.bottom, padding.left, padding.right, padding.top])

  return style
}
