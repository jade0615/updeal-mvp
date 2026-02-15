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

  // Verification State
  const [verifying, setVerifying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [verificationData, setVerificationData] = useState<{
    code: string
    name: string
    customerName: string
    customerPhone: string
  } | null>(null)

  const [history, setHistory] = useState<RedeemHistoryItem[]>([])

  // Stats state
  const [stats, setStats] = useState<{
    todayRedemptions: number;
    totalRedemptions: number;
    totalClaims: number;
    totalViews: number;
    walletAdditions: number;
  } | null>(null)

  // Full History State
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [fullHistory, setFullHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Claims List State
  const [claims, setClaims] = useState<any[]>([])
  const [claimsLoading, setClaimsLoading] = useState(false)

  const fetchClaims = async () => {
    setClaimsLoading(true)
    try {
      const res = await fetch(`/api/store/claims?slug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setClaims(data.claims)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setClaimsLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/store/redemptions?slug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setFullHistory(data.redemptions)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleOpenHistory = () => {
    setShowHistoryModal(true)
    fetchHistory()
  }

  // ... (Keep Auth useEffects same as original) ...
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

  // Fetch stats and claims when authenticated
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

      fetchClaims()
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

  // Step 1: Verify Coupon
  const handleVerify = async () => {
    if (!couponCode.trim()) {
      setResult({
        success: false,
        error: '请输入优惠券代码',
        message: '请输入优惠券代码'
      })
      return
    }

    setVerifying(true)
    setResult(null)

    try {
      const res = await fetch('/api/store/verify-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          merchantId
        })
      })

      const data = await res.json()

      if (data.success) {
        setVerificationData(data.coupon)
        setShowConfirmModal(true)
      } else {
        // Show error immediately if invalid
        setResult({
          success: false,
          message: data.message,
          errorCode: data.errorCode,
          error: data.message
        })
        // If already redeemed, add to history to show user
        if (data.errorCode === 'ALREADY_REDEEMED') {
          // We'd ideally want the coupon name here too, but verify endpoint might verify before checking redeemed.
          // Actually my verify logic checks redeemed status.
          // We can proceed to redeem if we want to record the attempt, but verify just returned error.
          // Let's just show the error result.
        }
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: '网络错误，请检查连接'
      })
    } finally {
      setVerifying(false)
    }
  }

  // Step 2: Confirm Redeem
  const handleRedeemConfirm = async () => {
    setShowConfirmModal(false)
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

      // Add to history with Name
      if (data.success || data.errorCode === 'ALREADY_REDEEMED') {
        const newItem: RedeemHistoryItem = {
          code: couponCode.trim().toUpperCase(),
          // Use verification data for name if available, or fallback
          // The redeem endpoint returns `coupon.offer`, we can use that too.
          couponName: verificationData?.name || data.coupon?.offer || '优惠券',
          time: new Date().toLocaleTimeString('zh-CN', { hour12: false, hour: '2-digit', minute: '2-digit' }),
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

      // Clear input on success
      if (data.success) {
        setTimeout(() => {
          setCouponCode('')
          setResult(null)
          setVerificationData(null)
        }, 5000) // Slightly longer to read success message
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

  // Key Press Handler (Triggers Verify)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !verifying && !loading) {
      handleVerify()
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
    // ... (Keep existing PIN screen exact logic) ...
    // To save tokens, I will assume the previous implementation of PIN screen is perfect 
    // and I'll just paste the relevant JSX structure or re-use if I could partially update.
    // Since I must replace the file content, I will re-write the PIN screen logic.
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {/* ... keeping header ... */}
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
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
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
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {pinLoading ? '验证中...' : '🔓 解锁'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Redemption Screen (Authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-600"
          >
            退出
          </button>
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <span className="text-3xl">🏪</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {merchantName}
          </h1>
          <p className="text-gray-500 text-sm">核销终端</p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
              <div className="bg-orange-50/80 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-bold text-orange-600 uppercase">今日核销</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.todayRedemptions}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-purple-600 uppercase">累计核销</p>
                <div className="flex items-end justify-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-purple-900">{stats.totalRedemptions}</p>
                  <button
                    onClick={handleOpenHistory}
                    className="text-xs text-purple-500 underline mb-1 hover:text-purple-700"
                  >
                    详情
                  </button>
                </div>
              </div>
            </div>

            {/* New Analytics Row: Views, Claims */}
            <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-blue-600 uppercase">浏览量</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalViews}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-green-600 uppercase">领取量</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalClaims}</p>
              </div>
            </div>

            {/* Real Data Perspective for Merchant */}
            <div className="bg-blue-600 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-90">📊 运营数据透视 (真实数据)</span>
                <div className="flex gap-4 text-sm font-bold">
                  <span>领取: {stats.totalClaims}</span>
                  <span>核销: {stats.totalRedemptions}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-blue-400/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalClaims > 0 ? (stats.totalRedemptions / stats.totalClaims) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] mt-1.5 opacity-70 text-right">核销率: {stats.totalClaims > 0 ? ((stats.totalRedemptions / stats.totalClaims) * 100).toFixed(1) : 0}%</p>
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
                disabled={loading || verifying}
                autoFocus
                className="w-full px-4 py-4 text-2xl font-mono text-center tracking-wider border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || verifying || !couponCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xl py-5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {verifying ? '查询中...' : '下一步: 验证'}
            </button>
          </div>

          {/* Result Message (Error or Success) */}
          {result && (
            <div className="mt-6 animation-fade-in">
              {result.success ? (
                <div className="bg-orange-50/80 border-2 border-orange-400 rounded-xl p-6 space-y-3 text-center backdrop-blur-sm">
                  <div className="text-5xl mb-2">✅</div>
                  <h3 className="text-2xl font-bold text-orange-800">核销成功!</h3>
                  <div className="text-orange-700">
                    <p className="font-bold text-lg">{result.coupon?.offer}</p>
                    <p className="text-sm opacity-80">顾客: {result.coupon?.customer}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {result.errorCode === 'ALREADY_REDEEMED' ? '⚠️' : '❌'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">
                      {result.errorCode === 'ALREADY_REDEEMED' ? '已核销' : '核销失败'}
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 最近核销
            </h2>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border l-4 ${item.success ? 'bg-orange-50/80 border-orange-200' : 'bg-orange-50 border-orange-200'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{item.couponName || 'Unknown Coupon'}</span>
                    <span className="font-mono text-xs text-gray-500">{item.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400">{item.time}</span>
                    <span className="text-lg">
                      {item.success ? '✅' : '⚠️'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim Records */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👥</span> 领取记录
          </h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">电话/邮箱</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">优惠券码</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">领取时间</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">预约到访</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claimsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-sm text-gray-500">加载中...</td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-sm text-gray-500">暂无领取记录</td>
                  </tr>
                ) : (
                  claims.map((claim, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.customerName}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div>{claim.customerPhone}</div>
                        <div className="opacity-60">{claim.customerEmail}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs font-mono text-gray-600">{claim.code}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-400">
                        {new Date(claim.createdAt).toLocaleString('zh-CN', {
                          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                        {claim.expectedVisitDate ? new Date(claim.expectedVisitDate).toLocaleDateString('zh-CN', {
                          month: '2-digit', day: '2-digit'
                        }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && verificationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">确认核销?</h3>
              <p className="text-sm text-gray-500 mt-1">请确认顾客信息与优惠券</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs uppercase font-bold">优惠券</span>
                <span className="text-right font-bold text-gray-900">{verificationData.name}</span>
              </div>
              <div className="h-px bg-gray-200 w-full" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs uppercase font-bold">顾客姓名</span>
                <span className="text-right font-medium text-gray-900">{verificationData.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs uppercase font-bold">顾客电话</span>
                <span className="text-right font-mono text-sm text-gray-600">{verificationData.customerPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setCouponCode('') // Check if user wants to clear or keep? Usually cancel means "wrong code", so clear/keep is debatable. Let's keep it so they can edit.
                }}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRedeemConfirm}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
              >
                确认核销
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📋</span> 全部核销记录 (最近100条)
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {historyLoading ? (
                <div className="p-12 text-center text-gray-500">
                  加载中...
                </div>
              ) : fullHistory.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  暂无核销记录
                </div>
              ) : (
                <div className="min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden m-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">时间</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">优惠券 / 折扣</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">顾客信息</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {fullHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(item.redeemed_at).toLocaleString('zh-CN', {
                                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-bold text-gray-900">{item.offer_discount}</div>
                              <div className="text-xs font-mono text-gray-500">{item.code}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{item.customer_name || '-'}</div>
                              <div className="text-xs text-gray-500">{item.customer_phone || item.customer_email || '-'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 text-center">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Re-add interfaces update
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
  couponName?: string // Newly added
}

interface MerchantPageProps {
  params: Promise<{ merchantSlug: string }>
}
