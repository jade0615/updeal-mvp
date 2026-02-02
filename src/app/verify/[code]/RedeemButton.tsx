'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface RedeemButtonProps {
  couponId: string
  couponCode: string
  merchantSlug?: string
  merchantName?: string
}

export default function RedeemButton({ couponId, couponCode, merchantSlug, merchantName }: RedeemButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPinDialog, setShowPinDialog] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [pin, setPin] = useState('')
  const router = useRouter()

  const handleOpenDialog = () => {
    setShowPinDialog(true)
    setError(null)
    setPin('')
  }

  const handleCloseDialog = () => {
    setShowPinDialog(false)
    setPin('')
    setError(null)
  }

  const handleRedeem = async () => {
    if (!pin.trim()) {
      setError('Please enter store PIN')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/public/coupons/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponId, pin: pin.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to redeem coupon')
      }

      // Success - close PIN dialog and show success dialog
      setShowPinDialog(false)
      setShowSuccessDialog(true)
      setLoading(false)
    } catch (err: any) {
      setError(err.message)
      setLoading(false)
    }
  }

  const handleCloseSuccess = () => {
    setShowSuccessDialog(false)
    router.refresh()
  }

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={handleOpenDialog}
          disabled={loading}
          className="w-full bg-gradient-to-r from-orange-400/90 to-amber-500/90 hover:from-orange-500 hover:to-amber-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
        >
          ✓ Redeem Coupon
        </button>

        <p className="text-center text-xs text-gray-500">
          ⚠️ Store staff will need to enter PIN to verify
        </p>
      </div>

      {/* PIN Dialog Modal */}
      {showPinDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="text-center">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Enter Store PIN
              </h3>
              <p className="text-sm text-gray-600">
                Coupon: <span className="font-mono font-bold">{couponCode}</span>
              </p>
            </div>

            <div className="space-y-2">
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700">
                Store PIN (4-6 digits)
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    handleRedeem()
                  } else if (e.key === 'Escape') {
                    handleCloseDialog()
                  }
                }}
                placeholder="Enter PIN"
                autoFocus
                disabled={loading}
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-orange-400 focus:ring-2 focus:ring-orange-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleCloseDialog}
                disabled={loading}
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRedeem}
                disabled={loading || !pin.trim()}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-400/90 to-amber-500/90 hover:from-orange-500 hover:to-amber-600 text-white font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 backdrop-blur-sm"
              >
                {loading ? (
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
                    Verifying...
                  </span>
                ) : (
                  'Confirm Redeem'
                )}
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center">
              Press Enter to confirm or Esc to cancel
            </p>
          </div>
        </div>
      )}

      {/* Success Dialog Modal */}
      {showSuccessDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-6">
            {/* Success Header */}
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600">
                Coupon redeemed successfully
              </p>
            </div>

            {/* Incentives */}
            <div className="space-y-3">
              {/* Next Visit Discount */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🎁</span>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Get 20% OFF your next visit!</h4>
                    <p className="text-sm text-gray-600">Use code: NEXT20 on your next reservation</p>
                  </div>
                </div>
              </div>

              {/* Share Incentive */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">👥</span>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 mb-1">Share with 3 friends & unlock exclusive rewards!</h4>
                    <p className="text-sm text-gray-600 mb-3">Help your friends discover great deals</p>
                    {merchantSlug && (
                      <button
                        onClick={() => {
                          const shareUrl = `https://hiraccoon.com/${merchantSlug}`;
                          if (navigator.share) {
                            navigator.share({
                              title: `Check out ${merchantName || 'this amazing deal'}!`,
                              text: 'I just used this coupon and got a great deal!',
                              url: shareUrl
                            });
                          } else {
                            navigator.clipboard.writeText(shareUrl);
                            alert('Link copied to clipboard!');
                          }
                        }}
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                      >
                        📤 Share Now
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Incentive */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Write a review & earn extra benefits!</h4>
                    <p className="text-sm text-gray-600">Share your experience and get bonus rewards</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={handleCloseSuccess}
              className="w-full bg-gradient-to-r from-orange-400/90 to-amber-500/90 hover:from-orange-500 hover:to-amber-600 text-white font-bold py-3 rounded-lg transition-all transform active:scale-95"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  )
}
