import { request } from './request'
import type { FavoriteItem, FavoritesCheckResponse, FavoritesToggleResponse, PaginatedData } from '../types/api'

export type FavoriteTargetType = 'music' | 'sample'

export const toggleFavorite = (data: { target_type: FavoriteTargetType; target_id: string }) =>
  request<FavoritesToggleResponse>({ url: '/favorites/toggle', method: 'POST', data })

export const getFavorites = (params?: { type?: FavoriteTargetType; page?: number; perPage?: number }) => {
  const query = new URLSearchParams()
  if (params?.type) query.set('type', params.type)
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  const suffix = query.toString()
  return request<PaginatedData<FavoriteItem>>({
    url: `/favorites${suffix ? `?${suffix}` : ''}`
  })
}

export const checkFavorite = (params: { target_type: FavoriteTargetType; target_id: string }) => {
  const query = new URLSearchParams({
    target_type: params.target_type,
    target_id: params.target_id
  })
  return request<FavoritesCheckResponse>({ url: `/favorites/check?${query.toString()}` })
}
