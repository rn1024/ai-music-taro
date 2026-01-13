import { View, Text, Textarea, Input, ScrollView, Picker, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useState } from 'react'
import { ModeSwitcher, PrimaryButton, CollapsibleSection } from '../../components'
import { createMusic, savePrompt, uploadReferenceAudio } from '../../services/music'
import type { CreateMode, MusicCreateRequest } from '../../types'
import { uploadIcon, micIcon, musicIcon, trash2Icon, userIcon, copyIcon, rotateCcwIcon, saveIcon, sparklesIcon } from '../../assets/icons'
import './index.scss'

// 原版灵感标签 - 完全保留
const INSPIRATION_TAGS = [
  "越南语", "短前奏", "舞曲节拍", "亡命乡村", "黑暗氛围",
  "脉动节拍", "黑暗赛博朋克", "平滑进行", "钢琴摇滚",
  "恐怖氛围", "90年代慢摇R&B", "巴恰塔", "传统",
  "侧链铺底", "新迷幻", "爵士鼓", "帮派合唱高潮",
  "悸动节拍", "男声", "律动节拍", "放慢", "耳语人声",
  "K-Pop", "R&B", "非传统", "魁北克法语", "说唱", "冲浪摇滚", "乌德琴",
  "拉丁", "反拍", "混响人声", "意大利语", "神圣", "键盘",
  "雷鸣般的打击乐", "变换", "极快", "工业音乐",
  "现代嘻哈", "歌剧新奥尔良爵士", "陷阱金属", "激昂小提琴",
  "贝斯", "柔和男声"
]

// 原版风格标签 - 完全保留
const CUSTOM_STYLE_TAGS = [
  "越南语", "短前奏", "舞曲节拍", "亡命乡村", "黑暗氛围",
  "脉动节拍", "黑暗赛博朋克", "平滑进行", "钢琴摇滚",
  "恐怖氛围", "90年代慢摇R&B", "巴恰塔", "传统",
  "侧链铺底", "新迷幻", "爵士鼓", "帮派合唱高潮",
  "悸动节拍", "男声", "律动节拍", "演歌人声", "说唱",
  "重低音增强", "抒情", "大乐队爵士", "EDM", "积极",
  "另类摇滚", "合成波", "朋克", "74 BPM", "环境音乐", "迷人",
  "墨西哥说唱", "重型乐句", "后故障艺术", "舒缓合成器", "双簧管",
  "旋律深房", "手风琴", "掉拍", "乌克兰民谣", "长歌",
  "新金属", "快节奏"
]

export default function Create() {
  const [mode, setMode] = useState<CreateMode>('basic')

  // === 简易模式状态 ===
  const [description, setDescription] = useState('')
  const [isInstrumental, setIsInstrumental] = useState(false)

  // === 专业模式状态 ===
  const [lyrics, setLyrics] = useState('')
  const [enhanceLyrics, setEnhanceLyrics] = useState('')
  const [styles, setStyles] = useState('')
  const [vocalGender, setVocalGender] = useState<'Male' | 'Female' | null>(null)
  const [lyricsMode, setLyricsMode] = useState<'Manual' | 'Auto'>('Manual')
  const [weirdness, setWeirdness] = useState(50)
  const [styleInfluence, setStyleInfluence] = useState(50)
  const [title, setTitle] = useState('')
  const [workspace, setWorkspace] = useState(0)

  // 折叠状态
  const [isLyricsOpen, setIsLyricsOpen] = useState(true)
  const [isStylesOpen, setIsStylesOpen] = useState(true)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isStylesExpanded, setIsStylesExpanded] = useState(false)

  const handleAddTag = (tag: string) => {
    setDescription(prev => {
      if (prev.endsWith(' ')) return prev + tag
      if (prev.length === 0) return tag
      return prev + ', ' + tag
    })
  }

  const handleAddStyle = (tag: string) => {
    setStyles(prev => {
      if (prev.endsWith(' ')) return prev + tag
      if (prev.length === 0) return tag
      return prev + ', ' + tag
    })
  }

  const handleClearBasic = () => {
    setDescription('')
    setIsInstrumental(false)
  }

  const handleClearPro = () => {
    setLyrics('')
    setEnhanceLyrics('')
    setStyles('')
    setVocalGender(null)
    setLyricsMode('Manual')
    setWeirdness(50)
    setStyleInfluence(50)
    setTitle('')
  }

  const handleUploadAudio = async () => {
    try {
      await uploadReferenceAudio({ format: 'mp3', duration: 0 })
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '上传失败', icon: 'none' })
    }
  }

  const handleSavePrompt = async () => {
    if (!lyrics.trim()) {
      Taro.showToast({ title: '请输入歌词内容', icon: 'none' })
      return
    }

    try {
      await savePrompt({ title: '歌词提示', content: lyrics, type: 'lyrics' })
      Taro.showToast({ title: '提示已保存', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    }
  }

  const handleGenerate = async () => {
    const payload: MusicCreateRequest =
      mode === 'basic'
        ? {
            mode: 'basic',
            description: description.trim(),
            isInstrumental
          }
        : {
            mode: 'pro',
            lyrics: lyrics.trim() || undefined,
            enhanceLyrics: enhanceLyrics.trim() || undefined,
            styles: styles.trim() || undefined,
            vocalGender: vocalGender ?? undefined,
            lyricsMode,
            weirdness,
            styleInfluence,
            title: title.trim() || undefined,
            workspace: workspace === 0 ? 'personal' : 'team',
            isInstrumental: !lyrics.trim()
          }

    try {
      Taro.showLoading({ title: '正在创建任务' })
      const task = await createMusic(payload)
      Taro.hideLoading()
      Taro.navigateTo({ url: `/pages/generating/index?task_id=${task.task_id}` })
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '创建失败', icon: 'none' })
    }
  }

  // ========== 简易模式 - 完全按原版 ==========
  const renderBasicMode = () => (
    <ScrollView className="mode-scroll" scrollY>
      <View className="basic-mode">
        {/* Song Description - 原版: 歌曲描述 * */}
        <View className="form-section">
          <Text className="form-label">歌曲描述 <Text className="required">*</Text></Text>
          <Textarea
            className="form-textarea"
            placeholder="描述你的歌曲灵感，例如：关于服务器朋友的叛逆重低音贝斯歌曲..."
            placeholderStyle="color: rgba(255, 255, 255, 0.3)"
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
          />
        </View>

        {/* Buttons Row - 原版: 上传音频 + 录制歌词 */}
        <View className="buttons-row">
          <View className="action-btn" onClick={handleUploadAudio}>
            <Image src={uploadIcon} className="btn-icon" mode="aspectFit" />
            <Text className="btn-text">上传音频</Text>
          </View>
          <View className="action-btn" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
            <Image src={micIcon} className="btn-icon" mode="aspectFit" />
            <Text className="btn-text">录制歌词</Text>
          </View>
        </View>

        {/* Instrumental Switch - 原版: 纯音乐模式 */}
        <View className="instrumental-card">
          <View className="instrumental-left">
            <View className={`instrumental-icon ${isInstrumental ? 'active' : ''}`}>
              <Image src={musicIcon} className="instrumental-icon-img" mode="aspectFit" />
            </View>
            <Text className="instrumental-label">纯音乐模式</Text>
          </View>
          <View
            className={`switch ${isInstrumental ? 'active' : ''}`}
            onClick={() => setIsInstrumental(!isInstrumental)}
          >
            <View className="switch-thumb" />
          </View>
        </View>

        {/* Inspiration Tags - 原版: 灵感参考 */}
        <View className="form-section">
          <Text className="form-label">灵感参考</Text>
          <View className="tags-wrap">
            {INSPIRATION_TAGS.map(tag => (
              <View key={tag} className="tag-item" onClick={() => handleAddTag(tag)}>
                <Text>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions - 原版 */}
        <View className="form-actions">
          <View className="clear-btn" onClick={handleClearBasic}>
            <Image src={trash2Icon} className="clear-icon" mode="aspectFit" />
            <Text className="clear-text">清空所有输入</Text>
          </View>
          <PrimaryButton
            block
            onClick={handleGenerate}
            disabled={!description.trim()}
          >
            <Text>立即创作</Text>
            <Text className="cost-hint">(消耗 10 积分)</Text>
          </PrimaryButton>
        </View>
      </View>
    </ScrollView>
  )

  // ========== 专业模式 - 完全按原版 ==========
  const renderProMode = () => (
    <ScrollView className="mode-scroll" scrollY>
      <View className="pro-mode">
        {/* Top Action Buttons - 原版: 3列按钮 */}
        <View className="top-actions">
          <View className="top-action-btn" onClick={handleUploadAudio}>
            <Image src={uploadIcon} className="action-icon" mode="aspectFit" />
            <Text className="action-label">上传音频</Text>
          </View>
          <View className="top-action-btn" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
            <Image src={userIcon} className="action-icon" mode="aspectFit" />
            <Text className="action-label">角色</Text>
          </View>
          <View className="top-action-btn" onClick={() => Taro.showToast({ title: '功能开发中', icon: 'none' })}>
            <Image src={copyIcon} className="action-icon" mode="aspectFit" />
            <Text className="action-label">灵感库</Text>
          </View>
        </View>

        {/* Lyrics Section - 原版 */}
        <CollapsibleSection
          title="歌词"
          subtitle={lyrics.length > 0 ? '自定义' : '纯音乐'}
          expanded={isLyricsOpen}
          onToggle={() => setIsLyricsOpen(!isLyricsOpen)}
        >
          <View className="lyrics-section">
            <Textarea
              className="lyrics-textarea"
              placeholder="输入歌词或故事... 留空则为纯音乐。"
              placeholderStyle="color: rgba(255, 255, 255, 0.3)"
              value={lyrics}
              onInput={(e) => setLyrics(e.detail.value)}
            />
            <Input
              className="enhance-input"
              placeholder="歌词增强指令 (例如：让歌词更快乐)..."
              placeholderStyle="color: rgba(255, 255, 255, 0.3)"
              value={enhanceLyrics}
              onInput={(e) => setEnhanceLyrics(e.detail.value)}
            />
            <View className="lyrics-actions">
              <View className="action-link">
                <Image src={rotateCcwIcon} className="link-icon" mode="aspectFit" />
                <Text>撤销</Text>
              </View>
              <View className="action-link" onClick={handleSavePrompt}>
                <Image src={saveIcon} className="link-icon" mode="aspectFit" />
                <Text>保存提示</Text>
              </View>
              <View className="action-link danger" onClick={() => setLyrics('')}>
                <Image src={trash2Icon} className="link-icon" mode="aspectFit" />
                <Text>清空</Text>
              </View>
            </View>
          </View>
        </CollapsibleSection>

        {/* Styles Section - 原版 */}
        <CollapsibleSection
          title="风格"
          expanded={isStylesOpen}
          onToggle={() => setIsStylesOpen(!isStylesOpen)}
        >
          <View className="styles-section">
            <Textarea
              className="styles-textarea"
              placeholder="输入风格描述 (例如：爵士鼓，帮派合唱，强劲节拍)..."
              placeholderStyle="color: rgba(255, 255, 255, 0.3)"
              value={styles}
              onInput={(e) => setStyles(e.detail.value)}
            />
            <View className="upsample-btn">
              <Image src={sparklesIcon} className="upsample-icon" mode="aspectFit" />
              <Text className="upsample-text">风格增强 (Upsample)</Text>
            </View>
            <View className="style-tags">
              {(isStylesExpanded ? CUSTOM_STYLE_TAGS : CUSTOM_STYLE_TAGS.slice(0, 15)).map(tag => (
                <View key={tag} className="style-tag" onClick={() => handleAddStyle(tag)}>
                  <Text>{tag}</Text>
                </View>
              ))}
              <View className="expand-btn" onClick={() => setIsStylesExpanded(!isStylesExpanded)}>
                <Text>{isStylesExpanded ? "收起 -" : "展开更多 +"}</Text>
              </View>
            </View>
          </View>
        </CollapsibleSection>

        {/* Advanced Options - 原版 */}
        <CollapsibleSection
          title="高级设置"
          expanded={isAdvancedOpen}
          onToggle={() => setIsAdvancedOpen(!isAdvancedOpen)}
        >
          <View className="advanced-section">
            {/* Vocal Gender & Lyrics Mode */}
            <View className="options-grid">
              <View className="option-group">
                <Text className="option-label">人声性别</Text>
                <View className="option-buttons">
                  <View
                    className={`option-btn ${vocalGender === 'Male' ? 'active' : ''}`}
                    onClick={() => setVocalGender('Male')}
                  >
                    <Text>男声</Text>
                  </View>
                  <View
                    className={`option-btn ${vocalGender === 'Female' ? 'active' : ''}`}
                    onClick={() => setVocalGender('Female')}
                  >
                    <Text>女声</Text>
                  </View>
                </View>
              </View>
              <View className="option-group">
                <Text className="option-label">歌词模式</Text>
                <View className="option-buttons">
                  <View
                    className={`option-btn ${lyricsMode === 'Manual' ? 'active' : ''}`}
                    onClick={() => setLyricsMode('Manual')}
                  >
                    <Text>手动</Text>
                  </View>
                  <View
                    className={`option-btn ${lyricsMode === 'Auto' ? 'active' : ''}`}
                    onClick={() => setLyricsMode('Auto')}
                  >
                    <Text>自动</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Weirdness Slider */}
            <View className="slider-group">
              <View className="slider-header">
                <Text className="slider-label">创意度 (Weirdness)</Text>
                <Text className="slider-value">{weirdness}%</Text>
              </View>
              <View className="slider-track">
                <View className="slider-fill" style={{ width: `${weirdness}%` }} />
              </View>
              <Text className="slider-hint">数值越高 = 结果越具实验性</Text>
            </View>

            {/* Style Influence Slider */}
            <View className="slider-group">
              <View className="slider-header">
                <Text className="slider-label">风格权重 (Style Influence)</Text>
                <Text className="slider-value">{styleInfluence}%</Text>
              </View>
              <View className="slider-track">
                <View className="slider-fill" style={{ width: `${styleInfluence}%` }} />
              </View>
              <Text className="slider-hint">50% 为适中</Text>
            </View>
          </View>
        </CollapsibleSection>

        {/* Bottom Options - 原版 */}
        <View className="bottom-options">
          <View className="form-field">
            <Text className="field-label">歌曲标题 <Text className="optional">(可选)</Text></Text>
            <Input
              className="field-input"
              placeholder="输入标题..."
              placeholderStyle="color: rgba(255, 255, 255, 0.3)"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
            />
          </View>

          <View className="form-field">
            <Text className="field-label">保存至...</Text>
            <Picker
              mode="selector"
              range={['我的工作台', '团队工作台']}
              value={workspace}
              onChange={(e) => setWorkspace(Number(e.detail.value))}
            >
              <View className="picker-display">
                <Text>{workspace === 0 ? '我的工作台' : '团队工作台'}</Text>
                <Text className="picker-arrow">›</Text>
              </View>
            </Picker>
          </View>
        </View>

        {/* Actions - 原版 */}
        <View className="form-actions">
          <View className="clear-btn" onClick={handleClearPro}>
            <Image src={trash2Icon} className="clear-icon" mode="aspectFit" />
            <Text className="clear-text">清空所有输入</Text>
          </View>
          <PrimaryButton
            block
            onClick={handleGenerate}
            disabled={!lyrics.trim() && !styles.trim()}
          >
            <Text>立即创作</Text>
            <Text className="cost-hint">(消耗 10 积分)</Text>
          </PrimaryButton>
        </View>
      </View>
    </ScrollView>
  )

  return (
    <View className="create-page">
      {/* 模式切换 */}
      <View className="mode-header">
        <ModeSwitcher value={mode} onChange={setMode} />
      </View>

      {/* 内容区域 */}
      <View className="mode-content">
        {mode === 'basic' ? renderBasicMode() : renderProMode()}
      </View>
    </View>
  )
}
