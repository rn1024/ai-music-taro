import { request } from './request'
import type { Category, HotSample, PaginatedData } from '../types/api'

export const getCategories = () => request<Category[]>({ url: '/discovery/categories' })

export const getHotSamples = (params?: {
  page?: number
  perPage?: number
  category?: string
}) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  if (params?.category) query.set('category', params.category)

  const suffix = query.toString() ? `?${query.toString()}` : ''
  return request<PaginatedData<HotSample>>({ url: `/discovery/hot-samples${suffix}` })
}
