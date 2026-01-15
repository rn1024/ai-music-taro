// ========================================
// AI Music Taro - 类型定义
// ========================================

// 创作模式
export type CreateMode = 'basic' | 'pro'

// 人声性别
export type VocalGender = 'Male' | 'Female' | null

// 歌词模式
export type LyricsMode = 'Manual' | 'Auto'

// 专业模式状态
export interface ProModeState {
  lyrics: string
  enhanceLyrics: string
  styles: string
  vocalGender: VocalGender
  lyricsMode: LyricsMode
  weirdness: number        // 0-100
  styleInfluence: number   // 0-100
  title: string
  workspace: string
}

// 简易模式状态
export interface BasicModeState {
  description: string
  isInstrumental: boolean
  selectedTags: string[]
}

// 历史记录状态
export type HistoryStatus = 'success' | 'generating' | 'failed'

// 历史记录项
export interface HistoryItem {
  id: string
  title: string
  cover: string
  status: HistoryStatus
  createdAt: string
  duration?: string
}

// 音乐作品
export interface MusicWork {
  id: string
  title: string
  cover: string
  author: string
  likes: number
  duration: string
  tags: string[]
}

// 生成结果
export interface GenerateResult {
  id: string
  title: string
  cover: string
  bpm: number
  duration: string
  variants: MusicVariant[]
}

// 音乐变体
export interface MusicVariant {
  id: string
  title: string
  cover: string
  duration: number
  bpm: number
}

// 用户信息
export interface UserInfo {
  id: string
  name: string
  avatar: string
  isPro: boolean
  credits: number
}

// 歌词时间戳数据
export interface LyricWord {
  word: string
  start: number
  end: number
}

// 歌词数据
export interface LyricsData {
  id: string
  audioId: string
  isInstrumental: boolean
  words: LyricWord[]
}

// 歌词 API 响应
export interface LyricsResponse {
  music_id: string
  lyrics: LyricsData[]
}

// 歌词汇总信息
export interface LyricsSummary {
  music_id: string
  hasLyrics: boolean
  hasInstrumental: boolean
  totalTracks: number
  processedAt?: string
}

export * from './api'
