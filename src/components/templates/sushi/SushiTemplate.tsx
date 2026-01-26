'use client'

import { TemplateProps, OfferType } from '../index'
import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import OfferBadge from '../../offers/OfferBadge'

interface CouponData {
  code: string
  verifyUrl: string
  merchantAddress?: string
  merchantPhone?: string
  offerDiscount: string
}

// Helper functions for offer styling
function getOfferGradient(type: OfferType): string {
  switch (type) {
    case 'discount':
      return 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
    case 'coupon':
      return 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    case 'bogo':
      return 'from-orange-50/80 to-amber-50/80 dark:from-orange-900/20 dark:to-amber-900/20'
    case 'reservation':
      return 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20'
    case 'free_item':
      return 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
    case 'bundle':
      return 'from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20'
    default:
      return 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20'
  }
}

function getOfferBorderColor(type: OfferType): string {
  switch (type) {
    case 'discount':
      return 'border-red-100 dark:border-red-800'
    case 'coupon':
      return 'border-purple-100 dark:border-purple-800'
    case 'bogo':
      return 'border-orange-200/70 dark:border-orange-800'
    case 'reservation':
      return 'border-blue-100 dark:border-blue-800'
    case 'free_item':
      return 'border-orange-100 dark:border-orange-800'
    case 'bundle':
      return 'border-indigo-100 dark:border-indigo-800'
    default:
      return 'border-red-100 dark:border-red-800'
  }
}

function getOfferBadgeColor(type: OfferType): string {
  switch (type) {
    case 'discount':
      return 'bg-red-500'
    case 'coupon':
      return 'bg-purple-500'
    case 'bogo':
      return 'bg-orange-400/90'
    case 'reservation':
      return 'bg-blue-500'
    case 'free_item':
      return 'bg-orange-500'
    case 'bundle':
      return 'bg-indigo-500'
    default:
      return 'bg-red-500'
  }
}

function getOfferTextColor(type: OfferType): string {
  switch (type) {
    case 'discount':
      return 'text-red-600 dark:text-red-400'
    case 'coupon':
      return 'text-purple-600 dark:text-purple-400'
    case 'bogo':
      return 'text-orange-600 dark:text-orange-400'
    case 'reservation':
      return 'text-blue-600 dark:text-blue-400'
    case 'free_item':
      return 'text-orange-600 dark:text-orange-400'
    case 'bundle':
      return 'text-indigo-600 dark:text-indigo-400'
    default:
      return 'text-red-600 dark:text-red-400'
  }
}

function getOfferIcon(type: OfferType): string {
  switch (type) {
    case 'discount':
      return '🏷️'
    case 'coupon':
      return '🎟️'
    case 'bogo':
      return '🎁'
    case 'reservation':
      return '📅'
    case 'free_item':
      return '🎉'
    case 'bundle':
      return '📦'
    default:
      return '🏷️'
  }
}

function getDefaultOfferTitle(type: OfferType): string {
  switch (type) {
    case 'discount':
      return 'SPECIAL DISCOUNT'
    case 'coupon':
      return 'COUPON OFFER'
    case 'bogo':
      return 'BUY ONE GET ONE'
    case 'reservation':
      return 'RESERVATION SPECIAL'
    case 'free_item':
      return 'FREE GIFT'
    case 'bundle':
      return 'BUNDLE DEAL'
    default:
      return 'SPECIAL OFFER'
  }
}

export default function SushiTemplate({ merchant }: TemplateProps) {
  const { content } = merchant
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [couponData, setCouponData] = useState<CouponData | null>(null)

  // Backward compatibility: use offer_type or default to 'discount'
  const offerType = content.offer_type || 'discount'
  const offerValue = content.offer_value || content.offerDiscount
  const offerBadgeText = content.offer_badge_text

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/public/coupons/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: merchant.id,
          phone,
          email
        })
      })

      if (res.ok) {
        const data = await res.json()
        setCouponData({
          code: data.coupon.code,
          verifyUrl: data.verifyUrl,
          merchantAddress: data.coupon.merchantAddress,
          merchantPhone: data.coupon.merchantPhone,
          offerDiscount: data.coupon.offerDiscount
        })
        setSuccess(true)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&display=swap');
        body {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
      `}</style>

      <div className="relative min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        {/* 响应式容器：手机端全宽，平板和桌面端居中 */}
        <div className="w-full max-w-md mx-auto md:max-w-2xl lg:max-w-4xl bg-white dark:bg-gray-800 shadow-xl">

          {/* Hero Section - 响应式图片高度 */}
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-gray-900 overflow-hidden">
            {/* 背景图片 */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${content.heroImageUrl}')` }}
            />

            {/* 渐变遮罩 */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

            {/* 评分徽章 - 右上角 */}
            {content.rating && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 bg-white/95 backdrop-blur-sm px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-500 text-lg md:text-xl">⭐</span>
                  <span className="text-gray-900 font-bold text-sm md:text-base">{content.rating}</span>
                </div>
              </div>
            )}

            {/* 优惠标签 - 左上角（可选） */}
            {offerValue && (
              <div className="absolute top-4 left-4 md:top-6 md:left-6">
                <OfferBadge
                  type={offerType}
                  value={offerValue}
                  badgeText={offerBadgeText}
                />
              </div>
            )}

            {/* 商家信息 - 底部 */}
            <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 lg:p-8">
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 md:mb-3 drop-shadow-lg">
                {content.heroTitle}
              </h1>
              <div className="flex items-center gap-2 text-white/90 text-sm md:text-base">
                <span>📍</span>
                <span className="font-medium">{content.heroSubtitle}</span>
              </div>
            </div>
          </div>

          {/* Main Content - 响应式间距 */}
          <main className="px-4 md:px-8 lg:px-12 py-6 md:py-8 lg:py-12 space-y-8 md:space-y-12">

            {/* 优惠券领取卡片 */}
            <div className={`bg-gradient-to-br ${getOfferGradient(offerType)} rounded-2xl md:rounded-3xl p-6 md:p-8 lg:p-10 shadow-lg border ${getOfferBorderColor(offerType)}`}>
              {/* 活动标题 */}
              <div className="text-center mb-6 md:mb-8">
                <div className={`inline-block ${getOfferBadgeColor(offerType)} text-white px-4 py-1 md:px-6 md:py-2 rounded-full text-xs md:text-sm font-bold uppercase tracking-wider mb-3 md:mb-4`}>
                  {getOfferIcon(offerType)} {content.offerTitle || getDefaultOfferTitle(offerType)}
                </div>
                <h2 className={`text-4xl md:text-5xl lg:text-6xl font-black ${getOfferTextColor(offerType)} mb-2 md:mb-3`}>
                  {offerBadgeText || offerValue}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm md:text-base lg:text-lg">
                  {content.offerDescription}
                </p>
              </div>

              {/* 表单或成功消息 */}
              {success && couponData ? (
                <div className="bg-white dark:bg-gray-900 rounded-xl md:rounded-2xl p-6 md:p-8 text-center space-y-6">
                  {/* Success Icon */}
                  <div className="text-5xl md:text-6xl">🎉</div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      领取成功！
                    </h3>
                    <p className="text-sm md:text-base text-red-600 dark:text-red-400 font-semibold">
                      📱 出示此二维码给店员
                    </p>
                  </div>

                  {/* QR Code */}
                  <div className="flex justify-center">
                    <div className="bg-white p-4 md:p-6 rounded-xl shadow-lg">
                      <QRCodeSVG
                        value={couponData.verifyUrl}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                  </div>

                  {/* Coupon Code */}
                  <div className="space-y-2">
                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Coupon Code
                    </p>
                    <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white tracking-wider font-mono">
                      {couponData.code}
                    </div>
                    <p className="text-xs md:text-sm text-orange-600 dark:text-orange-400 font-semibold">
                      ✓ {couponData.offerDiscount}
                    </p>
                  </div>

                  {/* Merchant Info */}
                  {(couponData.merchantAddress || couponData.merchantPhone) && (
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-3">
                      {couponData.merchantAddress && (
                        <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 text-sm md:text-base">
                          <span>📍</span>
                          <span>{couponData.merchantAddress}</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
                        {couponData.merchantAddress && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(couponData.merchantAddress)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <span>🗺️</span>
                            <span>Navigate</span>
                          </a>
                        )}

                        {couponData.merchantPhone && (
                          <a
                            href={`tel:${couponData.merchantPhone}`}
                            className="bg-orange-400/90 hover:bg-orange-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                            <span>📞</span>
                            <span>Call</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Fine Print */}
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    有效期30天 · 请保存此页面
                  </p>
                </div>
              ) : (
                <form onSubmit={handleClaim} className="space-y-3 md:space-y-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number *"
                    className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email (optional)"
                    className="w-full px-4 py-3 md:px-5 md:py-4 rounded-xl md:rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm md:text-base focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-base md:text-lg py-4 md:py-5 rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {loading ? 'Claiming...' : 'Get My Coupon →'}
                  </button>
                </form>
              )}

              {/* 小字提示 */}
              <p className="mt-4 text-center text-xs md:text-sm text-gray-500 dark:text-gray-400">
                Valid for new customers only.
              </p>
            </div>

            {/* MENU Section - 可选 */}
            {content.galleryImages && content.galleryImages.length > 0 && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
                  <span>📋</span>
                  <span>MENU</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                  {content.galleryImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
                    >
                      <img
                        src={img}
                        alt={`Menu item ${idx + 1}`}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REVIEWS Section - 可选 */}
            {content.features && content.features.length > 0 && (
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2 md:gap-3">
                  <span>⭐</span>
                  <span>REVIEWS</span>
                </h3>
                <div className="space-y-3 md:space-y-4">
                  {content.features.map((review, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-all"
                    >
                      <p className="text-gray-800 dark:text-gray-200 text-sm md:text-base mb-2 md:mb-3 italic">
                        "{review.title}"
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium">
                        — {review.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* Footer - UpDeal Branding */}
          <footer className="bg-gray-100 dark:bg-gray-800 py-6 md:py-8 px-4 md:px-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-red-500 text-xl md:text-2xl">✓</span>
                <span className="font-black text-xl md:text-2xl lg:text-3xl tracking-tight text-gray-900 dark:text-white">
                  UpDeal
                </span>
              </div>
              <p className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Official Partner
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
