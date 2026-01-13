import { request } from './request'
import type { CreditBalance, CreditTransaction, PaginatedData } from '../types/api'

export const getCreditBalance = () => request<CreditBalance>({ url: '/credits' })

export const getCreditTransactions = (params?: { page?: number; perPage?: number }) => {
  const query = new URLSearchParams()
  if (params?.page) query.set('page', String(params.page))
  if (params?.perPage) query.set('perPage', String(params.perPage))
  const suffix = query.toString() ? `?${query.toString()}` : ''

  return request<PaginatedData<CreditTransaction>>({ url: `/credits/transactions${suffix}` })
}

export const redeemCredits = (code: string) =>
  request<{ balance: number; transaction_id: number; card?: { value: number } }>({
    url: '/credits/redeem',
    method: 'POST',
    data: { code }
  })
