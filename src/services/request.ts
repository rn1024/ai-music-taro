import Taro from '@tarojs/taro'
import type { ApiResponse, AuthTokens } from '../types/api'

const API_PREFIX = '/api/v1'
const BASE_URL = process.env.TARO_APP_API_BASE ?? ''

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_AT_KEY = 'token_expires_at'

export const getStoredTokens = () => {
  const accessToken = Taro.getStorageSync(ACCESS_TOKEN_KEY)
  const refreshToken = Taro.getStorageSync(REFRESH_TOKEN_KEY)
  const expiresAt = Number(Taro.getStorageSync(TOKEN_EXPIRES_AT_KEY))

  return {
    accessToken: typeof accessToken === 'string' ? accessToken : '',
    refreshToken: typeof refreshToken === 'string' ? refreshToken : '',
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0
  }
}

export const saveTokens = (tokens: AuthTokens) => {
  const expiresAt = Date.now() + tokens.expires_in * 1000
  Taro.setStorageSync(ACCESS_TOKEN_KEY, tokens.access_token)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, tokens.refresh_token)
  Taro.setStorageSync(TOKEN_EXPIRES_AT_KEY, expiresAt)
}

export const clearTokens = () => {
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
  method?: Taro.request.Method
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

  const response = await Taro.request<ApiResponse<T>>({
    url: buildUrl(options.url),
    method: options.method ?? 'GET',
    data: options.data,
    header: headers
  })

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
