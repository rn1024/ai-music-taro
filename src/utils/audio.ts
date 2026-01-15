import Taro from '@tarojs/taro'

let audioContext: Taro.InnerAudioContext | null = null
let currentUrl = ''
let isPlaying = false

const ensureAudioContext = () => {
  if (audioContext) {
    return audioContext
  }

  if (typeof Taro.createInnerAudioContext !== 'function') {
    throw new Error('当前环境不支持音频播放')
  }

  audioContext = Taro.createInnerAudioContext()
  audioContext.autoplay = false

  audioContext.onPlay(() => {
    isPlaying = true
  })
  audioContext.onPause(() => {
    isPlaying = false
  })
  audioContext.onStop(() => {
    isPlaying = false
  })
  audioContext.onEnded(() => {
    isPlaying = false
  })
  audioContext.onError(() => {
    isPlaying = false
  })

  return audioContext
}

export const getAudioContext = () => ensureAudioContext()

export const getAudioState = () => ({ isPlaying, currentUrl })

export const playAudio = async (url: string) => {
  if (!url) {
    throw new Error('音频地址为空')
  }

  const ctx = ensureAudioContext()
  if (currentUrl && currentUrl !== url) {
    ctx.stop()
  }

  if (currentUrl !== url) {
    ctx.src = url
    currentUrl = url
  }

  ctx.play()
}

export const toggleAudio = async (url: string) => {
  const ctx = ensureAudioContext()

  if (currentUrl === url && isPlaying) {
    ctx.pause()
    return { playing: false }
  }

  await playAudio(url)
  return { playing: true }
}

