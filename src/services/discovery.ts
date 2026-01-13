import { request } from './request'
import type { Category, HotSample, LikeResponse, PaginatedData } from '../types/api'

export type SortType = 'hot' | 'latest' | 'likes'

export const getCategories = () => request<Category[]>({ url: '/discovery/categories' })

export const getHotSamples = (params?: {
  page?: number
  perPage?: number
  category?: string
  sort?: SortType
  keyword?: string
}) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  if (params?.category) query.set('category', params.category)
  if (params?.sort) query.set('sort', params.sort)
  if (params?.keyword) query.set('keyword', params.keyword)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<PaginatedData<HotSample>>({ url: `/discovery/hot-samples${suffix}` })
}

export const toggleSampleLike = (sampleId: string) => {
  return request<LikeResponse>({
    url: `/discovery/samples/${sampleId}/like`,
    method: 'POST'
  })
}
