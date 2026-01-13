import { PropsWithChildren, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { ensureWeappLogin } from './services/auth'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useEffect(() => {
    const initAuth = async () => {
      try {
        await ensureWeappLogin()
      } catch (error) {
        Taro.showToast({ title: '登录失败，请重试', icon: 'none' })
      }
    }

    initAuth()
  }, [])

  return children
}

export default App
