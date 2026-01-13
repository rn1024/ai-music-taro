// ========================================
// AI Music Taro - 生成步骤常量
// ========================================

export interface GeneratingStep {
  label: string
  duration: number
}

// 生成过程步骤
export const GENERATING_STEPS: GeneratingStep[] = [
  { label: '排队中...', duration: 2000 },
  { label: '正在作曲', duration: 4000 },
  { label: '编曲与合成', duration: 4000 },
  { label: '混音处理', duration: 3000 }
]

// 工作台选项
export const WORKSPACE_OPTIONS = [
  { label: '我的工作台', value: 'personal' },
  { label: '团队工作台', value: 'team' }
]
