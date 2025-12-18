'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMerchant, generateSlug } from '@/actions/merchants'
import type { MerchantFormData } from '@/lib/utils/validation'
import Link from 'next/link'

export default function NewMerchantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    slug: '',
    template_type: 'nail',
    logo_url: '',
    ga4_measurement_id: '',
    is_active: true,
    content: {
      businessName: '',
      heroTitle: '',
      heroSubtitle: '',
      heroImageUrl: '',
      offer_type: 'discount',
      offerTitle: '',
      offerDescription: '',
      offer_value: '', // replaced offerDiscount
      offer_badge_text: '', // new field
      offerDiscount: '', // keeping for type safety but ignoring
      features: [
        { title: '', description: '' },
        { title: '', description: '' },
        { title: '', description: '' },
      ],
      galleryImages: [],
      phone: '',
      address: { street: '', area: '', fullAddress: '' },
      primaryColor: '#ec4899',
    }
    /* Existing formData state */
  })

  // Auto-generate PIN on mount
  useEffect(() => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString()
    setFormData(prev => ({ ...prev, redeem_pin: randomPin }))
  }, [])

  const handleNameChange = async (name: string) => {
    setFormData({ ...formData, name })
    if (name) {
      const slug = await generateSlug(name)
      setFormData(prev => ({ ...prev, name, slug }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await createMerchant(formData)

    if (result.success) {
      router.push('/admin/merchants')
    } else {
      setError(result.error || 'Failed to create merchant')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                UpDeal
              </Link>
              <Link href="/admin/merchants" className="text-gray-700 hover:text-gray-900">
                商家管理
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">新增商家</h1>
          <p className="text-gray-600 mt-1">填写商家信息并创建落地页</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家名称 *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  落地页地址: /{formData.slug}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板类型 *
                </label>
                <select
                  value={formData.template_type}
                  onChange={(e) => setFormData({ ...formData, template_type: e.target.value as any })}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                >
                  <option value="nail">Nail (美甲)</option>
                  <option value="sushi">Sushi (寿司)</option>
                  <option value="chinese">Chinese (中餐)</option>
                  <option value="bbq">BBQ (烧烤)</option>
                  <option value="massage">Massage (按摩)</option>
                  <option value="boba">Boba (珍珠奶茶)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Analytics ID (可选)
                </label>
                <input
                  type="text"
                  value={formData.ga4_measurement_id}
                  onChange={(e) => setFormData({ ...formData, ga4_measurement_id: e.target.value })}
                  placeholder="G-XXXXXXXXXX"
                  className="w-full border rounded px-3 py-2 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  店铺核销密码 (PIN)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.redeem_pin || ''}
                    onChange={(e) => setFormData({ ...formData, redeem_pin: e.target.value })}
                    className="w-full border rounded px-3 py-2 text-gray-900 font-mono tracking-widest"
                    placeholder="1234"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, redeem_pin: Math.floor(1000 + Math.random() * 9000).toString() })}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
                    title="重新生成"
                  >
                    🔄
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  店员登录核销页面的密码 (自动生成，可修改)
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">页面内容</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero 标题 *
                </label>
                <input
                  type="text"
                  value={formData.content.heroTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, heroTitle: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero 副标题 *
                </label>
                <input
                  type="text"
                  value={formData.content.heroSubtitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, heroSubtitle: e.target.value }
                  })}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero 图片 URL *
                </label>
                <input
                  type="url"
                  value={formData.content.heroImageUrl}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, heroImageUrl: e.target.value }
                  })}
                  placeholder="https://example.com/hero.jpg"
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    优惠标题 *
                  </label>
                  <input
                    type="text"
                    value={formData.content.offerTitle}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, offerTitle: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    优惠类型 *
                  </label>
                  <select
                    value={formData.content.offer_type || 'discount'}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, offer_type: e.target.value as any }
                    })}
                    className="w-full border rounded px-3 py-2 text-gray-900 bg-white"
                  >
                    <option value="discount">Direct Discount (50% OFF)</option>
                    <option value="coupon">Coupon (Get $10 Off)</option>
                    <option value="bogo">BOGO (Buy 1 Get 1)</option>
                    <option value="reservation">Reservation (Book Now)</option>
                    <option value="free_item">Free Item (Free Appetizer)</option>
                    <option value="bundle">Bundle ($29.99 Special)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    核心价值/金额 (Offer Value) *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.content.offer_value || formData.content.offerDiscount}
                      onChange={(e) => setFormData({
                        ...formData,
                        content: {
                          ...formData.content,
                          offer_value: e.target.value,
                          offerDiscount: e.target.value // Keep synced for legacy
                        }
                      })}
                      placeholder="e.g. 50% OFF, $10, Buy 1 Get 1"
                      className="w-full border rounded px-3 py-2 text-gray-900"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      大字展示的内容 (如: 50%)
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    角标文案 (Badge Text)
                  </label>
                  <input
                    type="text"
                    value={formData.content.offer_badge_text || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, offer_badge_text: e.target.value }
                    })}
                    placeholder="e.g. LIMITED TIME, BEST VALUE"
                    className="w-full border rounded px-3 py-2 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={formData.content.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      content: { ...formData.content, phone: e.target.value }
                    })}
                    className="w-full border rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优惠描述 *
                </label>
                <textarea
                  value={formData.content.offerDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    content: { ...formData.content, offerDescription: e.target.value }
                  })}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Link
              href="/admin/merchants"
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
            >
              取消
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '创建中...' : '创建商家'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
