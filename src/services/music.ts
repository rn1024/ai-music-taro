import { request } from './request'
import type {
  DeleteResponse,
  LyricsResponse,
  MusicCreateRequest,
  MusicHistoryItem,
  MusicResult,
  MusicTask,
  MusicVariant,
  PaginatedData,
  ShareResponse,
  UploadResponse
} from '../types/api'

export const createMusic = (payload: MusicCreateRequest) =>
  request<MusicTask>({ url: '/music/create', method: 'POST', data: payload })

export const getMusicTask = (taskId: string) =>
  request<MusicTask>({ url: `/music/tasks/${taskId}` })

export const getMusicTaskDetail = (taskId: string) =>
  request<{ task: MusicTask; result: MusicResult | null }>({
    url: `/music/tasks/${taskId}/detail`
  })

export const uploadReferenceAudio = (payload: {
  file_url?: string
  duration?: number
  format?: string
}) => {
  const formData = new FormData()
  if (payload.file_url) formData.append('file_url', payload.file_url)
  if (payload.duration !== undefined) formData.append('duration', String(payload.duration))
  if (payload.format) formData.append('format', payload.format)

  return request<UploadResponse>({
    url: '/music/uploads',
    method: 'POST',
    data: formData,
    header: { 'Content-Type': 'multipart/form-data' }
  })
}

export const savePrompt = (payload: {
  title: string
  content: string
  type: 'lyrics' | 'styles'
}) => request({ url: '/music/prompts', method: 'POST', data: payload })

export const getMusicResult = (musicId: string) =>
  request<MusicResult>({ url: `/music/${musicId}` })

export const getMusicVariants = (musicId: string) =>
  request<MusicVariant[]>({ url: `/music/${musicId}/variants` })

export const downloadMusic = (musicId: string) =>
  request<{ download_url: string }>({
    url: `/music/${musicId}/download`,
    method: 'POST'
  })

export const shareMusic = (musicId: string, payload: { platform: 'weapp' | 'h5'; channel: 'session' | 'timeline' }) =>
  request<ShareResponse>({
    url: `/music/${musicId}/share`,
    method: 'POST',
    data: payload
  })

export const deleteMusic = (musicId: string) =>
  request<DeleteResponse>({ url: `/music/${musicId}`, method: 'DELETE' })

export const getMusicHistory = (params?: { page?: number; perPage?: number; status?: string }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  if (params?.status) query.set('status', String(params.status))
  const suffix = query.toString() ? `?${query.toString()}` : ''

  return request<PaginatedData<MusicHistoryItem>>({ url: `/music/history${suffix}` })
}

export const getMusicLyrics = (musicId: string) =>
  request<LyricsResponse>({ url: `/music/${musicId}/lyrics` })
