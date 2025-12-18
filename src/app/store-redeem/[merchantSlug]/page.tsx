'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'

interface RedeemResult {
  success: boolean
  message: string
  coupon?: {
    code: string
    merchant: string
    offer: string
    customer: string
    redeemedAt: string
  }
  error?: string
  errorCode?: string
}

interface RedeemHistoryItem {
  code: string
  time: string
  success: boolean
}

interface MerchantPageProps {
  params: Promise<{ merchantSlug: string }>
}

export default function MerchantStoreRedeemPage({ params }: MerchantPageProps) {
  const { merchantSlug } = use(params)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [merchantName, setMerchantName] = useState('')
  const [merchantId, setMerchantId] = useState('')

  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [history, setHistory] = useState<RedeemHistoryItem[]>([])

  // Stats state
  const [stats, setStats] = useState<{ todayRedemptions: number, totalRedemptions: number } | null>(null)

  // Check if already authenticated in this session
  useEffect(() => {
    const authKey = `store_auth_${merchantSlug}`
    const stored = sessionStorage.getItem(authKey)
    if (stored) {
      const { authenticated, merchantName: name, merchantId: id, timestamp } = JSON.parse(stored)
      // Session valid for 8 hours
      if (authenticated && Date.now() - timestamp < 8 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
        setMerchantName(name)
        setMerchantId(id)
      } else {
        sessionStorage.removeItem(authKey)
      }
    }
  }, [merchantSlug])

  // Fetch stats when authenticated
  useEffect(() => {
    if (isAuthenticated && merchantSlug) {
      fetch(`/api/store/stats?slug=${merchantSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats)
          }
        })
        .catch(err => console.error('Failed to load stats', err))
    }
  }, [isAuthenticated, merchantSlug])

  const handlePinSubmit = async () => {
    if (!pin.trim()) {
      setPinError('请输入密码')
      return
    }

    setPinLoading(true)
    setPinError('')

    try {
      const res = await fetch('/api/store/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug,
          pin: pin.trim()
        })
      })

      const data = await res.json()

      if (data.success) {
        // Store authentication in session
        const authKey = `store_auth_${merchantSlug}`
        sessionStorage.setItem(authKey, JSON.stringify({
          authenticated: true,
          merchantName: data.merchantName,
          merchantId: data.merchantId,
          timestamp: Date.now()
        }))

        setIsAuthenticated(true)
        setMerchantName(data.merchantName)
        setMerchantId(data.merchantId)
        setPin('')
      } else {
        setPinError(data.message || '密码错误')
      }
    } catch (error: any) {
      setPinError('验证失败，请重试')
    } finally {
      setPinLoading(false)
    }
  }

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !pinLoading) {
      handlePinSubmit()
    }
  }

  const handleRedeem = async () => {
    if (!couponCode.trim()) {
      setResult({
        success: false,
        error: '请输入优惠券代码',
        message: '请输入优惠券代码'
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/store/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          merchantId // Validate coupon belongs to this merchant
        })
      })

      const data = await res.json()

      setResult(data)

      // 添加到历史记录
      if (data.success || data.errorCode === 'ALREADY_REDEEMED') {
        const newItem: RedeemHistoryItem = {
          code: couponCode.trim().toUpperCase(),
          time: new Date().toLocaleTimeString('zh-CN'),
          success: data.success
        }
        setHistory(prev => [newItem, ...prev.slice(0, 9)])

        // Refresh stats after successful redemption
        if (data.success) {
          fetch(`/api/store/stats?slug=${merchantSlug}`)
            .then(res => res.json())
            .then(s => {
              if (s.success) setStats(s.stats)
            })
        }
      }

      // 成功后清空输入框
      if (data.success) {
        setTimeout(() => {
          setCouponCode('')
          setResult(null)
        }, 3000)
      }

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: '网络错误，请检查连接'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleRedeem()
    }
  }

  const handleLogout = () => {
    const authKey = `store_auth_${merchantSlug}`
    sessionStorage.removeItem(authKey)
    setIsAuthenticated(false)
    setMerchantName('')
    setMerchantId('')
    setHistory([])
    setStats(null)
  }

  // PIN Entry Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              店内核销系统
            </h1>
            <p className="text-gray-600 text-sm">
              {merchantSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="pin"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                输入店内密码
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setPinError('')
                }}
                onKeyPress={handlePinKeyPress}
                placeholder="••••"
                disabled={pinLoading}
                autoFocus
                className="w-full px-4 py-4 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {pinError && (
                <p className="mt-2 text-sm text-red-600">{pinError}</p>
              )}
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={pinLoading || !pin.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {pinLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  验证中...
                </span>
              ) : (
                '🔓 解锁'
              )}
            </button>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
            <p className="font-semibold mb-2">💡 说明:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>请输入店内核销密码</li>
              <li>密码由商家提供</li>
              <li>验证成功后可进行核销操作</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Redemption Screen (after authentication)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1" />
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <span className="text-4xl">🏪</span>
            </div>
            <div className="flex-1 flex justify-end">
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                退出
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {merchantName}
          </h1>
          <p className="text-gray-600">店内核销终端</p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-blue-600 uppercase">今日核销</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.todayRedemptions}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-purple-600 uppercase">累计核销</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.totalRedemptions}</p>
            </div>
          </div>
        )}

        {/* Main Redeem Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="couponCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                输入优惠券代码
              </label>
              <input
                id="couponCode"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="例如: BDRA-A7K9"
                disabled={loading}
                autoFocus
                className="w-full px-4 py-4 text-2xl font-mono text-center tracking-wider border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              />
            </div>

            <button
              onClick={handleRedeem}
              disabled={loading || !couponCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xl py-5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  核销中...
                </span>
              ) : (
                '✓ 确认核销'
              )}
            </button>
          </div>

          {/* Result Message */}
          {result && (
            <div className="mt-6">
              {result.success ? (
                <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl">✅</span>
                    <h3 className="text-2xl font-bold text-green-800">
                      核销成功！
                    </h3>
                  </div>
                  {result.coupon && (
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">优惠券:</span>
                        <span className="font-mono font-bold">{result.coupon.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">优惠:</span>
                        <span className="font-bold text-green-600">{result.coupon.offer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">顾客:</span>
                        <span className="font-mono">{result.coupon.customer}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-4xl">
                      {result.errorCode === 'ALREADY_REDEEMED' ? '⚠️' :
                        result.errorCode === 'WRONG_MERCHANT' ? '🚫' : '❌'}
                    </span>
                    <h3 className="text-xl font-bold text-red-800">
                      {result.errorCode === 'ALREADY_REDEEMED' ? '已核销' :
                        result.errorCode === 'WRONG_MERCHANT' ? '券码不属于本店' : '核销失败'}
                    </h3>
                  </div>
                  <p className="text-red-700 font-medium">{result.message}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span>
              核销记录
            </h2>
            <div className="space-y-2">
              {history.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${item.success ? 'bg-green-50' : 'bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {item.success ? '✅' : '⚠️'}
                    </span>
                    <div className="font-mono font-bold text-sm">
                      {item.code}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <p className="font-semibold mb-2">💡 使用说明:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>输入或扫描优惠券代码</li>
            <li>点击"确认核销"或按Enter键</li>
            <li>只能核销本店的优惠券</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>UpDeal 店内核销终端 v2.0</p>
          <p className="text-xs mt-1">仅供 {merchantName} 员工使用</p>
        </div>
      </div>
    </div>
  )
}
