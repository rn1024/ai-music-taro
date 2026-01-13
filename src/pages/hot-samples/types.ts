export type SortType = 'hot' | 'latest' | 'likes'

export interface SortOption {
  id: SortType
  label: string
}

export interface FilterParams {
  category: string
  sort: SortType
  keyword: string
}

export interface MappedSample {
  id: string
  title: string
  author: string
  likes: number
  duration: string
  image: string
  tag: string
  isLiked?: boolean
}
