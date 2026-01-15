import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useMemo, useState } from 'react'
import { getMusicTask } from '../../services/music'
import type { MusicTask } from '../../types'
import { minimizeIcon, xIcon, checkIcon } from '../../assets/icons'
import './index.scss'

const STEPS = [
  { label: '排队中...', status: 'queued' },
  { label: '正在作曲 (Composing)...', status: 'composing' },
  { label: '编曲与合成 (Arranging)...', status: 'arranging' },
  { label: '混音处理 (Mixing)...', status: 'mixing' }
]

const statusToStepIndex = (status?: string) => {
  const index = STEPS.findIndex((step) => step.status === status)
  if (index >= 0) return index
  if (status === 'done') return STEPS.length - 1
  return 0
}

const PROGRESS_RANGES: Record<string, { min: number; max: number }> = {
  queued: { min: 0, max: 8 },
  composing: { min: 10, max: 45 },
  arranging: { min: 45, max: 70 },
  mixing: { min: 70, max: 95 }
}

export default function Generating() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [task, setTask] = useState<MusicTask | null>(null)
  const [displayStatus, setDisplayStatus] = useState<MusicTask['status']>('queued')
  const [displayProgress, setDisplayProgress] = useState(0)
  const [headerStyle, setHeaderStyle] = useState<{ paddingTop: string } | null>(null)
  const taskId = Taro.getCurrentInstance().router?.params?.task_id
  const progressRange = useMemo(() => PROGRESS_RANGES[displayStatus] ?? { min: 0, max: 8 }, [displayStatus])

  useEffect(() => {
    if (!taskId) {
      Taro.showToast({ title: '缺少任务ID', icon: 'none' })
      return
    }

    let isActive = true
    let timer: ReturnType<typeof setInterval> | null = null
    let redirectTimer: ReturnType<typeof setTimeout> | null = null

    const stopPolling = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
      if (redirectTimer) {
        clearTimeout(redirectTimer)
        redirectTimer = null
      }
    }

    const pollTask = async () => {
      try {
        const data = await getMusicTask(taskId)
        if (!isActive) return

        setTask(data)
        setCurrentStepIndex(statusToStepIndex(data.status))
        setDisplayStatus(data.status)
        setDisplayProgress((prev) => {
          const range = PROGRESS_RANGES[data.status] ?? { min: 0, max: 8 }
          const serverProgress = typeof data.progress === 'number' ? data.progress : 0
          const next = Math.max(prev, range.min, serverProgress)
          return Math.min(range.max, next)
        })

        if (data.status === 'done' && data.result_id) {
          stopPolling()
          setDisplayProgress(100)
          redirectTimer = setTimeout(() => {
            Taro.redirectTo({ url: `/pages/result/index?music_id=${data.result_id}&preview=1` })
          }, 800)
        }

        if (data.status === 'failed') {
          stopPolling()
          Taro.showToast({ title: data.error_message || '生成失败', icon: 'none' })
        }
      } catch (error) {
        if (isActive) {
          Taro.showToast({ title: '状态获取失败', icon: 'none' })
        }
      }
    }

    pollTask()
    timer = setInterval(pollTask, 3000)

    return () => {
      isActive = false
      stopPolling()
    }
  }, [taskId])

  useEffect(() => {
    if (Taro.getEnv() !== Taro.ENV_TYPE.WEAPP) {
      return
    }

    try {
      const info = Taro.getSystemInfoSync()
      const menu = Taro.getMenuButtonBoundingClientRect?.()
      const safeTop = menu?.top ?? info.safeArea?.top ?? info.statusBarHeight ?? 0
      const basePadding = 24
      setHeaderStyle({ paddingTop: `${safeTop + basePadding}px` })
    } catch {
      setHeaderStyle(null)
    }
  }, [])

  useEffect(() => {
    if (displayStatus === 'done' || displayStatus === 'failed') {
      return
    }

    const timer = setInterval(() => {
      setDisplayProgress((prev) => {
        if (prev >= progressRange.max) return prev
        const step = displayStatus === 'queued' ? 2 : 3
        return Math.min(progressRange.max, Math.max(progressRange.min, prev + step))
      })
    }, 700)

    return () => clearInterval(timer)
  }, [displayStatus, progressRange])

  const handleMinimize = () => {
    Taro.showToast({ title: '最小化功能开发中', icon: 'none' })
  }

  const handleCancel = () => {
    Taro.showModal({
      title: '确认取消',
      content: '确定要取消生成吗？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateBack()
        }
      }
    })
  }

  return (
    <View className="generating-page">
      {/* Header Actions - 原版: Minimize + Close */}
      <View className="header-actions" style={headerStyle ?? undefined}>
        <View className="action-btn" onClick={handleMinimize}>
          <Image src={minimizeIcon} className="action-icon" mode="aspectFit" />
        </View>
        <View className="action-btn close" onClick={handleCancel}>
          <Image src={xIcon} className="action-icon" mode="aspectFit" />
        </View>
      </View>

      {/* Center Content */}
      <View className="center-content">
        {/* Equalizer Visualizer - 原版: 8-bar animated */}
        <View className="equalizer-container">
          {[...Array(8)].map((_, i) => (
            <View
              key={i}
              className="equalizer-bar"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.8 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </View>

        {/* Status Text - 原版 */}
        <Text className="status-text">{STEPS[currentStepIndex]?.label ?? '排队中...'}</Text>
        {task ? <Text className="status-text">{displayProgress}%</Text> : null}

        {/* Stepper - 原版: vertical with checkmarks */}
        <View className="stepper">
          {STEPS.map((step, index) => {
            const isActive = index === currentStepIndex
            const isCompleted = index < currentStepIndex

            return (
              <View key={step.status} className="step-item">
                <View className="step-indicator">
                  {isCompleted ? (
                    <View className="step-check">
                      <Image src={checkIcon} className="step-check-icon" mode="aspectFit" />
                    </View>
                  ) : isActive ? (
                    <View className="step-spinner" />
                  ) : (
                    <View className="step-circle" />
                  )}
                  {index < STEPS.length - 1 && (
                    <View className={`step-line ${isCompleted ? 'completed' : ''}`} />
                  )}
                </View>
                <Text className={`step-label ${isActive || isCompleted ? 'active' : ''}`}>
                  {step.label.split('(')[0]}
                </Text>
              </View>
            )
          })}
        </View>
      </View>

      {/* Bottom Text - 原版 */}
      <View className="bottom-text">
        <Text>AI 正在为你生成独一无二的旋律</Text>
      </View>
    </View>
  )
}
