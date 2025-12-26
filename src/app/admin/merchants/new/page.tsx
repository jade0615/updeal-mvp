'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMerchant, generateSlug } from '@/actions/merchants'
import type { MerchantFormData } from '@/lib/utils/validation'
import Link from 'next/link'

const PRESETS: Record<string, Partial<MerchantFormData>> = {
  arcadia: {
    name: 'Arcadia Entertainment',
    template_type: 'sushi', // Uses the clean white theme
    content: {
      businessName: 'ARCADIA',
      heroTitle: 'Grand Opening Special',
      heroSubtitle: 'West Palm Beach',
      heroImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
      offer_type: 'bundle',
      offerTitle: 'Grand Opening Bundle',
      offerDescription: 'Grand Opening & Christmas Special: 5 FREE Tokens + VIP Spin! Play Passes (30/40/60 Mins). BOGO 50% OFF. Free Gift with Share!',
      offer_value: 'ALL ACCESS',
      offerDiscount: 'ALL ACCESS',
      offer_badge_text: 'LIMITED TIME',
      features: [
        { title: 'Free Tokens', description: 'Get 5 Free Tokens just for visiting' },
        { title: 'VIP Spin', description: 'Win prizes on our lucky wheel' },
        { title: 'Play Area', description: 'Free Play Area access with first purchase' },
      ],
      galleryImages: [],
      phone: '(561) 247-7312',
      address: {
        street: '2885D N Military Trail',
        area: 'West Palm Beach, FL 33409',
        fullAddress: '2885D N Military Trail, West Palm Beach, FL 33409'
      },
      primaryColor: '#ec4899',
      openingHours: {
        isOpen: true,
        currentStatus: 'Open Daily',
        closingTime: '9:00 PM', // Legacy
        specialHours: '11:00 AM – 9:00 PM'
      },
    }
  },
  restaurant: {
    name: 'Tasty Restaurant',
    template_type: 'sushi',
    content: {
      businessName: 'Tasty Restaurant',
      heroTitle: 'Holiday Feast',
      heroSubtitle: 'Family Special',
      heroImageUrl: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop',
      offer_type: 'discount',
      offerTitle: 'Family Feast Special',
      offerDescription: 'Get 20% OFF your entire bill when you dine with us this weekend.',
      offer_value: '20% OFF',
      offerDiscount: '20% OFF',
      offer_badge_text: 'BEST VALUE',
      features: [],
      galleryImages: [],
      phone: '',
      address: { street: '', area: '', fullAddress: '' },
    }
  }
}

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
    virtual_base_count: 200,
    is_active: true,
    content: {
      businessName: '',
      heroTitle: '',
      heroSubtitle: '',
      heroImageUrl: '',
      offer_type: 'discount',
      offerTitle: '',
      offerDescription: '',
      offer_value: '',
      offer_badge_text: '',
      offerDiscount: '',
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
  })

  // Auto-generate PIN on mount
  useEffect(() => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString()
    setFormData(prev => ({ ...prev, redeem_pin: randomPin }))
  }, [])

  const handleNameChange = async (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      content: {
        ...prev.content,
        businessName: name // Sync business name with merchant name
      }
    }))
    if (name) {
      try {
        const slug = await generateSlug(name)
        setFormData(prev => ({ ...prev, slug: slug || '' }))
      } catch (e) {
        console.error('Slug generation failed', e)
      }
    }
  }

  const applyPreset = async (key: string) => {
    const preset = PRESETS[key]
    if (!preset) return

    try {
      // Merge preset into formData, handling nested content
      const newContent = {
        ...formData.content,
        ...preset.content
      }

      const baseName = preset.name || 'New Campaign'
      let slug = ''
      try {
        slug = await generateSlug(baseName)
      } catch (e) {
        console.error('Slug error in preset', e)
      }

      setFormData(prev => ({
        ...prev,
        ...preset,
        name: baseName,
        slug: slug || prev.slug,
        content: newContent
      }))
    } catch (e) {
      console.error('Preset application failed', e)
      setError('Failed to apply preset')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await createMerchant(formData)

      if (result.success) {
        router.push('/admin/merchants')
      } else {
        setError(result.error || 'Failed to create merchant')
        setLoading(false)
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred')
      setLoading(false)
    }
  }

  const updateContent = (field: keyof typeof formData.content, value: any) => {
    setFormData(prev => ({
      ...prev,
      content: {
        ...prev.content,
        [field]: value
      }
    }))
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
          <h1 className="text-2xl font-bold text-gray-900">新增商家 / 落地页</h1>
          <p className="text-gray-600 mt-1">创建新的营销活动落地页</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Quick Fill Toolbar */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-indigo-900 mb-3">🚀 快速填充模板 (Quick Fill)</h3>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => applyPreset('arcadia')}
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-md shadow-sm hover:bg-indigo-50 flex items-center gap-2"
            >
              🎮 Arcade / Entertainment
            </button>
            <button
              type="button"
              onClick={() => applyPreset('restaurant')}
              className="px-4 py-2 bg-white border-indigo-200 text-indigo-700 rounded-md shadow-sm hover:bg-indigo-50 flex items-center gap-2"
            >
              🍣 Restaurant / Dining
            </button>
          </div>
          <p className="text-xs text-indigo-600 mt-2">点击上方按钮可快速填充内容，然后只需修改细节。</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">基本信息</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商家/活动名称 *
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL Slug (链接后缀) *
                </label>
                <input
                  type="text"
                  value={formData.slug || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  落地页地址: updeal.top/{formData.slug || '...'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  模板类型 *
                </label>
                <select
                  value={formData.template_type}
                  onChange={(e) => setFormData(prev => ({ ...prev, template_type: e.target.value as any }))}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                >
                  <option value="sushi">Modern White (通用/Arcadia)</option>
                  <option value="nail">Nail (美甲)</option>
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
                  value={formData.ga4_measurement_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, ga4_measurement_id: e.target.value }))}
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
                    onChange={(e) => setFormData(prev => ({ ...prev, redeem_pin: e.target.value }))}
                    className="w-full border rounded px-3 py-2 text-gray-900 font-mono tracking-widest"
                    placeholder="1234"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, redeem_pin: Math.floor(1000 + Math.random() * 9000).toString() }))}
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  营销热度-虚拟基数 (Virtual Base Heat)
                </label>
                <input
                  type="number"
                  value={formData.virtual_base_count || 200}
                  onChange={(e) => setFormData(prev => ({ ...prev, virtual_base_count: parseInt(e.target.value) || 0 }))}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  placeholder="200"
                />
                <p className="text-xs text-gray-500 mt-1">
                  显示销量 = 真实销量 + 虚拟基数。建议设为 100-500 以增加信任感。
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
                  value={formData.content.heroTitle || ''}
                  onChange={(e) => updateContent('heroTitle', e.target.value)}
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
                  value={formData.content.heroSubtitle || ''}
                  onChange={(e) => updateContent('heroSubtitle', e.target.value)}
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
                  value={formData.content.heroImageUrl || ''}
                  onChange={(e) => updateContent('heroImageUrl', e.target.value)}
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
                    value={formData.content.offerTitle || ''}
                    onChange={(e) => updateContent('offerTitle', e.target.value)}
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
                    onChange={(e) => updateContent('offer_type', e.target.value)}
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
                      value={formData.content.offer_value || formData.content.offerDiscount || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          content: {
                            ...prev.content,
                            offer_value: val,
                            offerDiscount: val
                          }
                        }));
                      }}
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
                    onChange={(e) => updateContent('offer_badge_text', e.target.value)}
                    placeholder="e.g. LIMITED TIME, BEST VALUE"
                    className="w-full border rounded px-3 py-2 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    官方网站 (可选)
                  </label>
                  <input
                    type="url"
                    value={formData.content.website || ''}
                    onChange={(e) => updateContent('website', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full border rounded px-3 py-2 text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    联系电话
                  </label>
                  <input
                    type="tel"
                    value={formData.content.phone || ''}
                    onChange={(e) => updateContent('phone', e.target.value)}
                    className="w-full border rounded px-3 py-2 text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优惠描述 *
                </label>
                <textarea
                  value={formData.content.offerDescription || ''}
                  onChange={(e) => updateContent('offerDescription', e.target.value)}
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  required
                />
              </div>

              {/* Address Section */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">地址信息</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address (显示在页面的地址)</label>
                  <input
                    type="text"
                    value={formData.content.address?.fullAddress || ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      content: {
                        ...prev.content,
                        address: {
                          ...(prev.content.address || {}),
                          fullAddress: e.target.value
                        }
                      }
                    }))}
                    className="w-full border rounded px-3 py-2 text-gray-900"
                    placeholder="e.g. 123 Main St, New York, NY"
                  />
                </div>
              </div>

              {/* Data Collection Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">数据收集设置 (Data Collection)</h3>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.content.requirements?.collectName ?? true}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          requirements: {
                            collectName: e.target.checked,
                            collectEmail: prev.content.requirements?.collectEmail ?? false
                          }
                        }
                      }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">收集姓名 (Name)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.content.requirements?.collectEmail ?? false}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          requirements: {
                            collectName: prev.content.requirements?.collectName ?? true,
                            collectEmail: e.target.checked
                          }
                        }
                      }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <span className="text-sm text-gray-700">收集邮箱 (Email)</span>
                  </label>
                </div>
              </div>

              {/* Custom Labels Settings */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-900">高级文案定制 (Advanced Text Customization)</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 p-4 rounded-lg">

                  <div className="col-span-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Claim Form (领券表单)</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">标题 (Section Title)</label>
                    <input
                      type="text"
                      placeholder="Get Your Coupon"
                      value={formData.content.customLabels?.section_title_claim || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, section_title_claim: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">按钮文字 (Button Text)</label>
                    <input
                      type="text"
                      placeholder="Claim Coupon Now"
                      value={formData.content.customLabels?.button_text_claim || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, button_text_claim: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="col-span-2 mt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Success State (领券成功 - Discount Mode)</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">成功标题 (Title)</label>
                    <input
                      type="text"
                      placeholder="Coupon Claimed!"
                      value={formData.content.customLabels?.success_title || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, success_title: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">副标题 (Subtitle)</label>
                    <input
                      type="text"
                      placeholder="Show this code to the staff."
                      value={formData.content.customLabels?.success_subtitle || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, success_subtitle: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="col-span-2 mt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">VIP Welcome (VIP 模式文案)</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">欢迎标题 (VIP Title)</label>
                    <input
                      type="text"
                      placeholder="Welcome to the Club!"
                      value={formData.content.customLabels?.vip_welcome_title || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, vip_welcome_title: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">欢迎详情 (VIP Subtitle)</label>
                    <textarea
                      placeholder="You are now on our VIP list..."
                      value={formData.content.customLabels?.vip_welcome_subtitle || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, vip_welcome_subtitle: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                      rows={2}
                    />
                  </div>

                  <div className="col-span-2 mt-2">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Section Headers (页脚标题)</h4>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Visit Title</label>
                    <input
                      type="text"
                      placeholder="Visit Us"
                      value={formData.content.customLabels?.section_title_visit || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, section_title_visit: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Hours Title</label>
                    <input
                      type="text"
                      placeholder="Opening Hours"
                      value={formData.content.customLabels?.section_title_hours || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, section_title_hours: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Website Title</label>
                    <input
                      type="text"
                      placeholder="Website"
                      value={formData.content.customLabels?.section_title_website || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, section_title_website: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Call Title</label>
                    <input
                      type="text"
                      placeholder="Call Us"
                      value={formData.content.customLabels?.section_title_call || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        content: {
                          ...prev.content,
                          customLabels: { ...prev.content.customLabels, section_title_call: e.target.value }
                        }
                      }))}
                      className="w-full border rounded px-3 py-2 text-sm"
                    />
                  </div>

                </div>
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
              {loading ? '创建中...' : '创建商户页面'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
