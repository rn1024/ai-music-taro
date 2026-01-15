import { request } from './request'
import type {
  PaginatedData,
  UserLikeItem,
  UserProfile,
  UserProfileUpdateResponse,
  WeappProfileResponse
} from '../types/api'

export const getCurrentUser = () => request<UserProfile>({ url: '/users/current' })

export const updateUserProfile = (data: {
  nickname?: string
  avatar?: string
  gender?: number
  birthday?: string
}) => request<UserProfileUpdateResponse>({ url: '/users/current/profile', method: 'PATCH', data })

export const bindWeappProfile = (data: {
  nickname: string
  avatar: string
  gender: number
  province: string
  city: string
  unionid?: string
  openid?: string
}) => request<WeappProfileResponse>({ url: '/auth/weapp/bindProfile', method: 'POST', data })

export const getUserLikes = (params?: { page?: number; perPage?: number }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  const suffix = query.toString()
  return request<PaginatedData<UserLikeItem>>({
    url: `/users/current/likes${suffix ? `?${suffix}` : ''}`
  })
}
