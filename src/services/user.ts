import { request } from './request'
import type { UserProfile } from '../types/api'

export const getCurrentUser = () => request<UserProfile>({ url: '/users/current' })
