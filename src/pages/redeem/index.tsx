import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useEffect, useState } from 'react'
import { GlassCard, PrimaryButton } from '../../components'
import { getCreditBalance, redeemCredits } from '../../services/credits'
import './index.scss'

type RedeemRecord = {
  code: string
  value: number
  date: string
}

const STORAGE_RECORDS_KEY = 'redeemRecords'

const getStoredRecords = (): RedeemRecord[] => {
  const stored = Taro.getStorageSync(STORAGE_RECORDS_KEY)
  return Array.isArray(stored) ? stored : []
}

export default function RedeemPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState(0)
  const [records, setRecords] = useState<RedeemRecord[]>(getStoredRecords)

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const data = await getCreditBalance()
        setBalance(data.balance)
      } catch (error) {
        Taro.showToast({ title: '积分加载失败', icon: 'none' })
      }
    }

    fetchBalance()
  }, [])

  const handleRedeem = async () => {
    const normalized = code.trim().toUpperCase()

    if (!normalized || normalized.length < 6) {
      Taro.showToast({ title: '请输入有效兑换码', icon: 'none' })
      return
    }

    if (records.some((record) => record.code === normalized)) {
      Taro.showToast({ title: '兑换码已使用', icon: 'none' })
      return
    }

    setLoading(true)

    try {
      const previous = balance
      const result = await redeemCredits(normalized)
      const value = result.card?.value ?? Math.max(result.balance - previous, 0)
      const nextRecord = {
        code: normalized,
        value,
        date: new Date().toISOString().slice(0, 10)
      }
      const nextRecords = [nextRecord, ...records].slice(0, 8)

      setBalance(result.balance)
      setRecords(nextRecords)
      setCode('')
      Taro.setStorageSync(STORAGE_RECORDS_KEY, nextRecords)

      Taro.showToast({ title: `兑换成功 +${value}`, icon: 'success' })
    } catch (error) {
      Taro.showToast({ title: '兑换失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <View className="redeem-page">
      <ScrollView className="redeem-scroll" scrollY>
        <View className="redeem-header">
          <Text className="redeem-title">兑换码兑换</Text>
          <Text className="redeem-subtitle">输入兑换码即可领取积分</Text>
        </View>

        <GlassCard className="redeem-card" variant="highlight" padding="none">
          <View className="redeem-input-wrap">
            <Text className="redeem-label">兑换码</Text>
            <Input
              className="redeem-input"
              value={code}
              placeholder="例如 SUNO-XXXX-YYYY"
              onInput={(event) => setCode(event.detail.value)}
            />
          </View>
          <PrimaryButton block loading={loading} onClick={handleRedeem}>
            确认兑换
          </PrimaryButton>
        </GlassCard>

        <GlassCard className="balance-card" padding="none">
          <Text className="balance-label">当前积分</Text>
          <View className="balance-value">
            <Text className="balance-number">{balance}</Text>
            <Text className="balance-unit">次</Text>
          </View>
        </GlassCard>

        <View className="records-section">
          <Text className="records-title">最近兑换记录</Text>
          {records.length === 0 ? (
            <GlassCard className="record-empty" padding="none">
              <Text className="record-empty-text">暂无兑换记录</Text>
            </GlassCard>
          ) : (
            <View className="records-list">
              {records.map((record) => (
                <GlassCard className="record-item" key={record.code} padding="none">
                  <View className="record-main">
                    <Text className="record-code">{record.code}</Text>
                    <Text className="record-date">{record.date}</Text>
                  </View>
                  <Text className="record-value">+{record.value}</Text>
                </GlassCard>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  )
}
