'use client'

import { useState } from 'react'

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
  merchant: string
  time: string
  success: boolean
}

export default function StoreRedeemPage() {
  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)
  const [history, setHistory] = useState<RedeemHistoryItem[]>([])

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
        body: JSON.stringify({ couponCode: couponCode.trim() })
      })

      const data = await res.json()

      setResult(data)

      // 添加到历史记录
      if (data.success || data.errorCode === 'ALREADY_REDEEMED') {
        const newItem: RedeemHistoryItem = {
          code: couponCode.trim().toUpperCase(),
          merchant: data.coupon?.merchant || '未知商家',
          time: new Date().toLocaleTimeString('zh-CN'),
          success: data.success
        }
        setHistory(prev => [newItem, ...prev.slice(0, 9)]) // 保留最近10条
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
            <span className="text-4xl">🏪</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            店内核销系统
          </h1>
          <p className="text-gray-600">UpDeal Store Redeem Terminal</p>
        </div>

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
                placeholder="例如: XMAS-A7K9"
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
                <div className="bg-orange-50/80 border-2 border-orange-400 rounded-xl p-6 space-y-3 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-5xl">✅</span>
                    <h3 className="text-2xl font-bold text-orange-800">
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
                        <span className="text-gray-600">商家:</span>
                        <span className="font-semibold">{result.coupon.merchant}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">优惠:</span>
                        <span className="font-bold text-orange-600">{result.coupon.offer}</span>
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
                      {result.errorCode === 'ALREADY_REDEEMED' ? '⚠️' : '❌'}
                    </span>
                    <h3 className="text-xl font-bold text-red-800">
                      {result.errorCode === 'ALREADY_REDEEMED' ? '已核销' : '核销失败'}
                    </h3>
                  </div>
                  <p className="text-red-700 font-medium">{result.message}</p>
                  {result.coupon && result.errorCode === 'ALREADY_REDEEMED' && (
                    <div className="mt-3 pt-3 border-t border-red-200 text-sm space-y-1">
                      <div className="flex justify-between text-red-600">
                        <span>优惠券:</span>
                        <span className="font-mono font-bold">{result.coupon.code}</span>
                      </div>
                      <div className="flex justify-between text-red-600">
                        <span>商家:</span>
                        <span>{result.coupon.merchant}</span>
                      </div>
                    </div>
                  )}
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
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    item.success ? 'bg-orange-50/80' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {item.success ? '✅' : '⚠️'}
                    </span>
                    <div>
                      <div className="font-mono font-bold text-sm">
                        {item.code}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.merchant}
                      </div>
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
            <li>输入优惠券代码（如 XMAS-A7K9）</li>
            <li>点击&quot;确认核销&quot;或按Enter键</li>
            <li>查看核销结果和历史记录</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>UpDeal 店内核销终端 v1.0</p>
          <p className="text-xs mt-1">仅供店内员工使用</p>
        </div>
      </div>
    </div>
  )
}
