import Taro from '@tarojs/taro'
import type { ApiResponse, AuthTokens } from '../types/api'

const API_PREFIX = '/api/v1'
const BASE_URL = process.env.TARO_APP_API_BASE ?? ''

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at'

const cachedTokens = {
  accessToken: '',
  refreshToken: '',
  expiresAt: 0
}

export const getStoredTokens = () => {
  if (cachedTokens.accessToken) {
    return { ...cachedTokens }
  }

  const unwrapStorageValue = (value: unknown) => {
    if (value && typeof value === 'object' && 'data' in value) {
      return (value as { data?: unknown }).data ?? ''
    }

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value) as { data?: unknown }
        if (parsed && typeof parsed === 'object' && 'data' in parsed) {
          return parsed.data ?? ''
        }
      } catch {
        return value
      }
    }

    return value
  }

  const accessToken = unwrapStorageValue(Taro.getStorageSync(ACCESS_TOKEN_KEY))
  const refreshToken = unwrapStorageValue(Taro.getStorageSync(REFRESH_TOKEN_KEY))
  const expiresAt = unwrapStorageValue(Taro.getStorageSync(TOKEN_EXPIRES_AT_KEY))

  cachedTokens.accessToken = typeof accessToken === 'string' ? accessToken : ''
  cachedTokens.refreshToken = typeof refreshToken === 'string' ? refreshToken : ''
  cachedTokens.expiresAt =
    typeof expiresAt === 'number' ? expiresAt : Number(expiresAt) || 0

  return { ...cachedTokens }
}

export const saveTokens = (tokens: AuthTokens) => {
  const expiresAt = Date.now() + tokens.expires_in * 1000
  cachedTokens.accessToken = tokens.access_token
  cachedTokens.refreshToken = tokens.refresh_token
  cachedTokens.expiresAt = expiresAt
  Taro.setStorageSync(ACCESS_TOKEN_KEY, tokens.access_token)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, tokens.refresh_token)
  Taro.setStorageSync(TOKEN_EXPIRES_AT_KEY, expiresAt)
}

export const clearTokens = () => {
  cachedTokens.accessToken = ''
  cachedTokens.refreshToken = ''
  cachedTokens.expiresAt = 0
  Taro.removeStorageSync(ACCESS_TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
  Taro.removeStorageSync(TOKEN_EXPIRES_AT_KEY)
}

const buildUrl = (url: string) => {
  if (url.startsWith('http')) {
    return url
  }

  const normalized = url.startsWith('/') ? url : `/${url}`
  return `${BASE_URL}${API_PREFIX}${normalized}`
}

const refreshAccessToken = async (refreshToken: string) => {
  const response = await Taro.request<ApiResponse<AuthTokens>>({
    url: buildUrl('/auth/refresh'),
    method: 'POST',
    data: { refresh_token: refreshToken }
  })

  if (!response.data || response.data.code !== 0) {
    throw new Error(response.data?.msg || '刷新失败')
  }

  saveTokens(response.data.data)
  return response.data.data
}

export type RequestOptions = {
  url: string
  method?: string
  data?: Record<string, any>
  header?: Record<string, string>
  auth?: boolean
  retry?: boolean
}

export const request = async <T>(options: RequestOptions): Promise<T> => {
  const { accessToken, refreshToken } = getStoredTokens()
  const auth = options.auth !== false
  const headers = {
    ...(options.header ?? {}),
    ...(auth && accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
  }

  const rawRequestOptions = {
    url: buildUrl(options.url),
    method: options.method ?? 'GET',
    data: options.data,
    header: headers
  }

  const response = await Taro.request<ApiResponse<T>>(
    rawRequestOptions as unknown as Parameters<typeof Taro.request>[0]
  )

  const responseData = response.data
  const needsRefresh = response.statusCode === 401 || responseData?.code === 401

  if (needsRefresh && refreshToken && !options.retry) {
    await refreshAccessToken(refreshToken)
    return request<T>({ ...options, retry: true })
  }

  if (!responseData || responseData.code !== 0) {
    throw new Error(responseData?.msg || '请求失败')
  }

  return responseData.data
}
