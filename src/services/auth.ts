import Taro from '@tarojs/taro'
import { getStoredTokens, request, saveTokens, clearTokens } from './request'
import type { AuthLoginResponse, AuthTokens } from '../types/api'

export const ensureWeappLogin = async () => {
  const { accessToken, expiresAt } = getStoredTokens()
  if (accessToken && (!expiresAt || expiresAt > Date.now())) {
    try {
      await request({ url: '/users/current' })
      return null
    } catch (error) {
      clearTokens()
    }
  }

  const loginResult =
    Taro.getEnv() === Taro.ENV_TYPE.WEAPP
      ? await Taro.login()
      : { code: 'h5-dev-code' }
  if (!loginResult.code) {
    throw new Error('登录失败')
  }

  const response = await request<AuthLoginResponse>({
    url: '/auth/weapp/login',
    method: 'POST',
    data: { code: loginResult.code },
    auth: false
  })

  saveTokens(response.tokens)
  return response
}

export const refreshTokens = async (refreshToken: string) => {
  const response = await request<AuthTokens>({
    url: '/auth/refresh',
    method: 'POST',
    data: { refresh_token: refreshToken },
    auth: false
  })

  saveTokens(response)
  return response
}

export const logout = async () => {
  try {
    await request({ url: '/auth/logout', method: 'POST' })
  } finally {
    clearTokens()
  }
}
