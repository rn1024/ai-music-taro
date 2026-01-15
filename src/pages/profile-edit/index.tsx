import Taro, { useDidShow } from '@tarojs/taro'
import { Image as TaroImage, Input, Picker, ScrollView, Text as TaroText, View } from '@tarojs/components'
import { useState } from 'react'
import { GlassCard, PrimaryButton } from '../../components'
import { bindWeappProfile, getCurrentUser, updateUserProfile } from '../../services/user'
import type { UserProfile } from '../../types/api'
import { userIcon, chevronRightIcon } from '../../assets/icons'
import './index.scss'

const GENDER_OPTIONS = ['未知', '男', '女']

const maskPhone = (phone?: string | null) => {
  if (!phone) return '未绑定'
  if (phone.length < 7) return phone
  return `${phone.slice(0, 3)}****${phone.slice(-4)}`
}

export default function ProfileEdit() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(false)

  useDidShow(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser()
        setProfile(data)
      } catch (error) {
        Taro.showToast({ title: '加载失败', icon: 'none' })
      }
    }

    fetchProfile()
  })

  const handleSyncWeappProfile = async () => {
    try {
      const result = await Taro.getUserProfile({ desc: '用于完善用户资料' })
      const info = result.userInfo
      if (!info) {
        return
      }

      const response = await bindWeappProfile({
        nickname: info.nickName,
        avatar: info.avatarUrl,
        gender: info.gender ?? 0,
        province: info.province || '',
        city: info.city || ''
      })

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              nickname: response.nickname ?? info.nickName,
              avatar: response.avatar ?? info.avatarUrl,
              gender: response.gender ?? info.gender ?? 0,
              province: response.province ?? info.province,
              city: response.city ?? info.city
            }
          : prev
      )
    } catch (error) {
      Taro.showToast({ title: '获取失败', icon: 'none' })
    }
  }

  const handleSave = async () => {
    if (!profile) return

    setLoading(true)
    try {
      await updateUserProfile({
        nickname: profile.nickname,
        gender: profile.gender,
        birthday: profile.birthday || undefined,
        avatar: profile.avatar || undefined
      })
      Taro.showToast({ title: '保存成功', icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '保存失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handleNicknameChange = (value: string) => {
    setProfile((prev) => (prev ? { ...prev, nickname: value } : prev))
  }

  const handleGenderChange = (value: number) => {
    setProfile((prev) => (prev ? { ...prev, gender: value } : prev))
  }

  const handleBirthdayChange = (value: string) => {
    setProfile((prev) => (prev ? { ...prev, birthday: value } : prev))
  }

  return (
    <View className="profile-edit-page">
      <ScrollView className="profile-scroll" scrollY>
        <GlassCard className="profile-avatar" padding="none" onClick={handleSyncWeappProfile}>
          <View className="avatar-left">
            <TaroText className="label">头像</TaroText>
            <TaroText className="tip">点击同步微信头像</TaroText>
          </View>
          <View className="avatar-right">
            <View className="avatar-wrap">
              <TaroImage src={profile?.avatar || userIcon} className="avatar" mode="aspectFill" />
            </View>
            <TaroImage src={chevronRightIcon} className="chevron" mode="aspectFit" />
          </View>
        </GlassCard>

        <View className="profile-form">
          <GlassCard className="form-item" padding="none">
            <View className="form-row">
              <TaroText className="label">昵称</TaroText>
              <Input
                value={profile?.nickname || ''}
                placeholder="请输入昵称"
                maxlength={20}
                onInput={(e: { detail: { value: string } }) => handleNicknameChange(e.detail.value)}
                className="form-input"
              />
            </View>
          </GlassCard>

          <GlassCard className="form-item" padding="none">
            <Picker
              mode="selector"
              range={GENDER_OPTIONS}
              value={profile?.gender ?? 0}
              onChange={(e: { detail: { value: number | string } }) =>
                handleGenderChange(Number(e.detail.value))
              }
            >
              <View className="form-row picker-row">
                <TaroText className="label">性别</TaroText>
                <View className="picker-value">
                  <TaroText>{GENDER_OPTIONS[profile?.gender ?? 0]}</TaroText>
                  <TaroImage src={chevronRightIcon} className="chevron" mode="aspectFit" />
                </View>
              </View>
            </Picker>
          </GlassCard>

          <GlassCard className="form-item" padding="none">
            <Picker
              mode="date"
              value={profile?.birthday || ''}
              onChange={(e: { detail: { value: string } }) => handleBirthdayChange(e.detail.value)}
            >
              <View className="form-row picker-row">
                <TaroText className="label">生日</TaroText>
                <View className="picker-value">
                  <TaroText>{profile?.birthday || '请选择'}</TaroText>
                  <TaroImage src={chevronRightIcon} className="chevron" mode="aspectFit" />
                </View>
              </View>
            </Picker>
          </GlassCard>

          <GlassCard className="form-item" padding="none">
            <View className="form-row">
              <TaroText className="label">手机号</TaroText>
              <TaroText className="value-text">{maskPhone(profile?.phone)}</TaroText>
            </View>
          </GlassCard>
        </View>

        <View className="save-button-wrap">
          <PrimaryButton block onClick={handleSave} loading={loading}>
            保存
          </PrimaryButton>
        </View>
      </ScrollView>
    </View>
  )
}
