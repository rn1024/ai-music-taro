import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { useState } from 'react'
import { GlassCard, PrimaryButton } from '../../components'
import { getCreditBalance } from '../../services/credits'
import { getCurrentUser } from '../../services/user'
import type { UserProfile } from '../../types'
import { userIcon, creditCardIcon, giftIcon, circleHelpIcon, settingsIcon, chevronRightIcon, heartIcon, saveIcon, musicIcon } from '../../assets/icons'
import './index.scss'

interface MenuItemProps {
  icon: string
  label: string
  onClick?: () => void
}

const MenuItem = ({ icon, label, onClick }: MenuItemProps) => (
  <GlassCard
    className="menu-item"
    padding="none"
    onClick={onClick}
  >
    <View className="menu-left">
      <View className="menu-icon-wrap">
        <Image src={icon} className="menu-icon" mode="aspectFit" />
      </View>
      <Text className="menu-label">{label}</Text>
    </View>
    <Image src={chevronRightIcon} className="menu-arrow" mode="aspectFit" />
  </GlassCard>
)

export default function Me() {
  const [balance, setBalance] = useState(0)
  const [user, setUser] = useState<UserProfile | null>(null)

  useDidShow(() => {
    const fetchProfile = async () => {
      try {
        const [profile, credits] = await Promise.all([
          getCurrentUser(),
          getCreditBalance()
        ])
        setUser(profile)
        setBalance(credits.balance)
      } catch (error) {
        Taro.showToast({ title: '用户信息加载失败', icon: 'none' })
      }
    }

    fetchProfile()
  })

  const handleRecharge = () => {
    Taro.showToast({ title: '充值功能开发中', icon: 'none' })
  }

  const handleRedeem = () => {
    Taro.navigateTo({ url: '/pages/redeem/index' })
  }

  const handleMenuClick = (label: string) => {
    Taro.showToast({ title: `${label}功能开发中`, icon: 'none' })
  }

  const handleEditProfile = () => {
    Taro.navigateTo({ url: '/pages/profile-edit/index' })
  }

  const handleLikes = () => {
    Taro.navigateTo({ url: '/pages/likes/index' })
  }

  const handleFavorites = () => {
    Taro.navigateTo({ url: '/pages/favorites/index' })
  }

  const handleHistory = () => {
    Taro.switchTab({ url: '/pages/history/index' })
  }

  return (
    <View className="me-page">
      <ScrollView className="me-scroll" scrollY>
        {/* User Card - 原版 */}
        <View className="user-card" onClick={handleEditProfile}>
          <View className="avatar-wrap">
            <View className="avatar">
              <Image
                src={user?.avatar || userIcon}
                className={user?.avatar ? 'avatar-image' : 'avatar-icon'}
                mode="aspectFill"
              />
            </View>
            {user?.is_pro ? (
              <View className="pro-badge">
                <Text>PRO</Text>
              </View>
            ) : null}
          </View>
          <View className="user-info">
            <Text className="user-name">{user?.nickname ?? 'Music Maker'}</Text>
            <Text className="user-id">ID: {user?.id ?? '--'}</Text>
          </View>
        </View>

        {/* Credits Card - 原版 */}
        <GlassCard className="credits-card" variant="highlight" padding="none">
          <View className="credits-glow" />
          <View className="credits-content">
            <View className="credits-left">
              <Text className="credits-label">剩余额度</Text>
              <View className="credits-value-wrap">
                <Text className="credits-value">{balance}</Text>
                <Text className="credits-unit">次</Text>
              </View>
            </View>
            <View className="credits-right">
              <PrimaryButton size="sm" onClick={handleRecharge}>
                立即充值
              </PrimaryButton>
            </View>
          </View>
        </GlassCard>

        {/* Menu List - 原版 */}
        <View className="menu-list">
          <MenuItem icon={userIcon} label="编辑资料" onClick={handleEditProfile} />
          <MenuItem icon={heartIcon} label="我的点赞" onClick={handleLikes} />
          <MenuItem icon={saveIcon} label="我的收藏" onClick={handleFavorites} />
          <MenuItem icon={musicIcon} label="我的创作" onClick={handleHistory} />
          <MenuItem icon={creditCardIcon} label="消费记录" onClick={() => handleMenuClick('消费记录')} />
          <MenuItem icon={giftIcon} label="兑换码兑换" onClick={handleRedeem} />
          <MenuItem icon={circleHelpIcon} label="使用指引" onClick={() => handleMenuClick('使用指引')} />
          <MenuItem icon={settingsIcon} label="设置" onClick={() => handleMenuClick('设置')} />
        </View>
      </ScrollView>
    </View>
  )
}
