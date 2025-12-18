import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import RedeemButton from './RedeemButton'

interface PageProps {
  params: { code: string }
}

export default async function VerifyCouponPage({ params }: PageProps) {
  const supabase = createAdminClient()
  const code = params.code

  // Fetch coupon with merchant and user info
  const { data: coupon, error } = await supabase
    .from('coupons')
    .select(`
      id,
      code,
      status,
      created_at,
      expires_at,
      redeemed_at,
      merchants (
        id,
        name,
        content
      ),
      users (
        phone
      )
    `)
    .eq('code', code)
    .single()

  // Code doesn't exist
  if (error || !coupon) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Code</h1>
          <p className="text-gray-600">This coupon code does not exist.</p>
        </div>
      </div>
    )
  }

  // Check expiration
  const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date()
  const isRedeemed = coupon.status === 'redeemed'
  const isValid = coupon.status === 'active' && !isExpired

  // Get phone last 4 digits
  const phoneLastFour = (coupon.users as any)?.phone?.slice(-4) || '****'

  // Format dates
  const claimedDate = new Date(coupon.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const redeemedDate = coupon.redeemed_at
    ? new Date(coupon.redeemed_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    : null

  const expiresDate = coupon.expires_at
    ? new Date(coupon.expires_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : null

  // Get merchant details
  const merchant = coupon.merchants as any
  const offerDiscount = merchant?.content?.offerDiscount || '10% OFF'
  const merchantAddress = merchant?.content?.address || merchant?.content?.heroSubtitle
  const merchantPhone = merchant?.content?.phone

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 text-white text-center">
          <div className="text-5xl mb-3">
            {isValid && '✅'}
            {isRedeemed && '🎫'}
            {isExpired && '⏰'}
          </div>
          <h1 className="text-2xl font-bold">
            {isValid && 'Valid Coupon'}
            {isRedeemed && 'Already Redeemed'}
            {isExpired && 'Coupon Expired'}
          </h1>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Coupon Code */}
          <div className="text-center">
            <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
              Coupon Code
            </p>
            <div className="text-3xl font-black font-mono text-gray-900 tracking-wider">
              {coupon.code}
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${isValid
                  ? 'bg-green-100 text-green-800'
                  : isRedeemed
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-red-100 text-red-800'
                }`}
            >
              {isValid && '✓ Active'}
              {isRedeemed && '✓ Redeemed'}
              {isExpired && '✗ Expired'}
            </span>
          </div>

          {/* Details */}
          <div className="space-y-4 border-t border-b border-gray-200 py-6">
            {/* Merchant */}
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-sm">Merchant</span>
              <span className="text-gray-900 font-semibold text-right">
                {merchant?.name || 'N/A'}
              </span>
            </div>

            {/* Offer */}
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-sm">Offer</span>
              <span className="text-green-600 font-bold text-lg">{offerDiscount}</span>
            </div>

            {/* Customer */}
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-sm">Customer</span>
              <span className="text-gray-900 font-mono">***{phoneLastFour}</span>
            </div>

            {/* Claimed Date */}
            <div className="flex justify-between items-start">
              <span className="text-gray-500 text-sm">Claimed</span>
              <span className="text-gray-900 text-sm text-right">{claimedDate}</span>
            </div>

            {/* Expiration */}
            {expiresDate && (
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Expires</span>
                <span className="text-gray-900 text-sm text-right">{expiresDate}</span>
              </div>
            )}

            {/* Redeemed Date */}
            {isRedeemed && redeemedDate && (
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-sm">Redeemed</span>
                <span className="text-gray-900 text-sm text-right">{redeemedDate}</span>
              </div>
            )}
          </div>

          {/* Merchant Location */}
          {merchantAddress && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-gray-400">📍</span>
                <span className="text-gray-700">{merchantAddress}</span>
              </div>
              {merchantPhone && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400">📞</span>
                  <span className="text-gray-700">{merchantPhone}</span>
                </div>
              )}
            </div>
          )}

          {/* Redeem Button - Only show if valid */}
          {isValid && (
            <RedeemButton couponId={coupon.id} couponCode={coupon.code} />
          )}

          {/* Error Messages */}
          {isRedeemed && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 text-sm">
                This coupon has already been used and cannot be redeemed again.
              </p>
            </div>
          )}

          {isExpired && (
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-red-600 text-sm font-semibold">
                This coupon has expired and is no longer valid.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 text-center border-t border-gray-200">
          <div className="flex items-center justify-center gap-2">
            <span className="text-red-500 font-bold">✓</span>
            <span className="text-gray-900 font-bold text-lg">UpDeal</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Verified by UpDeal</p>
        </div>
      </div>
    </div>
  )
}
