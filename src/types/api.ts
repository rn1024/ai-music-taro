export interface ApiResponse<T> {
  code: number
  msg: string
  data: T
  error?: string
}

export interface PaginationMeta {
  total: number
  lastPage: number
  currentPage: number
  perPage: number
  prev: number | null
  next: number | null
}

export interface PaginatedData<T> {
  meta: PaginationMeta
  list: T[]
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthLoginResponse {
  tokens: AuthTokens
  is_phone_bound: boolean
}

export interface UserProfile {
  id: string
  nickname: string
  avatar: string
  phone: string | null
  gender: number
  birthday: string | null
  province: string | null
  city: string | null
  register_source: string
  last_login_at: string | null
  is_pro: boolean
  credits: number
  created_at: string
}

export interface CreditBalance {
  balance: number
  unit: string
}

export interface CreditTransaction {
  id: number
  type: 'consume' | 'recharge' | 'refund'
  amount: number
  balance: number
  description: string
  action?: string | null
  reference_id?: string | null
  created_at: string
}

export interface Category {
  id: string
  name: string
}

export interface HotSample {
  id: string
  title: string
  author: string
  likes: number
  duration: number
  cover: string
  tag: string
  isLiked?: boolean
}

export interface MusicCreateRequest {
  mode: 'basic' | 'pro'
  description?: string
  isInstrumental?: boolean
  lyrics?: string
  enhanceLyrics?: string
  styles?: string
  vocalGender?: 'Male' | 'Female'
  lyricsMode?: 'Manual' | 'Auto'
  weirdness?: number
  styleInfluence?: number
  title?: string
  workspace?: 'personal' | 'team'
}

export interface MusicTask {
  task_id: string
  status: 'queued' | 'composing' | 'arranging' | 'mixing' | 'done' | 'failed'
  progress: number
  result_id?: string
  provider?: string | null
  provider_task_id?: string | null
  error_code?: number | null
  error_message?: string | null
  credits_cost?: number | null
  credits_txn_id?: number | null
  created_at: string
}

export interface MusicVariant {
  id: string
  title: string
  duration: number
  bpm: number
  cover: string
  audio_url: string
}

export interface MusicResult {
  id: string
  title: string
  duration: number
  bpm: number
  cover: string
  audio_url: string
  prompt: string
  variants: MusicVariant[]
  created_at: string
}

export interface MusicHistoryItem {
  id: string
  title: string
  status: 'success' | 'processing' | 'failed'
  duration: number
  cover: string
  created_at: string
}

export interface UploadResponse {
  upload_id: string
  file_url: string
}

export interface PromptResponse {
  id: string
  title: string
  content: string
  type: 'lyrics' | 'styles'
  created_at: string
}

export interface ShareResponse {
  shared: boolean
  platform: 'weapp' | 'h5'
  channel: 'session' | 'timeline'
}

export interface DeleteResponse {
  deleted: boolean
  id: string
}

export interface LikeResponse {
  liked: boolean
  likes: number
}

export interface FavoriteTargetMusic {
  id: string
  title: string
  cover: string
  audio_url: string
  duration: number
}

export interface FavoriteTargetSample {
  id: string
  title: string
  author: string
  cover: string
  duration: number
  likes: number
  tag?: string
}

export interface FavoriteItem {
  id: string
  target_type: 'music' | 'sample'
  target_id: string
  created_at: string
  target: FavoriteTargetMusic | FavoriteTargetSample | null
}

export interface FavoritesToggleResponse {
  favorited: boolean
}

export interface FavoritesCheckResponse {
  favorited: boolean
}

export interface UserProfileUpdateResponse {
  id: string
  nickname: string
  avatar: string
  gender: number
  birthday: string | null
}

export interface WeappProfileResponse {
  nickname: string
  avatar: string
  gender: number
  province: string
  city: string
  unionid?: string
  openid?: string
}

export interface UserLikeItem {
  id: string
  sample_id: string
  created_at: string
  sample: FavoriteTargetSample | null
}
