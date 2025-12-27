'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMerchant, generateSlug } from '@/actions/merchants'
import type { MerchantFormData } from '@/lib/utils/validation'
import Link from 'next/link'
import { MapPin, Clock, Phone, Globe } from 'lucide-react'

export default function NewMerchantPage() {
    const router = useRouter()
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    // Initialize with default matching the schema
    const [formData, setFormData] = useState<MerchantFormData>({
        name: '',
        slug: '',
        template_type: 'nail',
        logo_url: '',
        ga4_measurement_id: '',
        meta_pixel_id: '',
        redeem_pin: '',
        virtual_base_count: 200,
        is_active: true,
        content: {
            businessName: '',
            businessType: 'Restaurant',
            priceRange: '$$',
            establishedYear: 2020,
            logoUrl: '',
            rating: 4.8,
            reviewCount: '100',
            offer: {
                type: 'Exclusive',
                value: '20% OFF',
                unit: 'Off',
                description: '',
                totalLimit: 500,
            },
            address: {
                street: '',
                area: '',
                fullAddress: '',
            },
            phone: '',
            openingHours: {
                isOpen: true,
                currentStatus: 'Open Now',
                closingTime: '10 PM',
                specialHours: '',
            },
            reviews: [],
            heroTitle: '',
            heroSubtitle: '',
            heroImageUrl: '',
            features: [],
            galleryImages: [],
            customLabels: {},
            requirements: {
                collectName: true,
                collectEmail: false
            }
        }
    })

    // Auto-generate PIN on mount
    useEffect(() => {
        const randomPin = Math.floor(1000 + Math.random() * 9000).toString()
        setFormData(prev => ({ ...prev, redeem_pin: randomPin }))
    }, [])

    // Auto-generate slug when name changes
    const handleNameChange = async (name: string) => {
        setFormData(prev => ({
            ...prev,
            name,
            content: {
                ...prev.content,
                businessName: name
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const result = await createMerchant(formData)

            if (result.success) {
                router.push('/admin/merchants')
            } else {
                setError(result.error || 'Failed to create merchant')
                setSaving(false)
            }
        } catch (e: any) {
            setError(e.message || 'An unknown error occurred')
            setSaving(false)
        }
    }

    // Helper to update nested content fields
    const updateContent = (path: string, value: any) => {
        setFormData(prev => {
            const newContent = { ...prev.content };

            if (!path.includes('.')) {
                (newContent as any)[path] = value;
                return { ...prev, content: newContent };
            }

            const [parent, child] = path.split('.');
            if (parent && child) {
                if (!(newContent as any)[parent]) {
                    (newContent as any)[parent] = {};
                }
                (newContent as any)[parent] = {
                    ...(newContent as any)[parent],
                    [child]: value
                };
            }
            return { ...prev, content: newContent };
        });
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

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">新增商家</h1>
                    <p className="text-gray-600 mt-1">创建新的营销落地页</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-8">
                    {/* ============================================================ */}
                    {/* 📍 区域1: 页面顶部 - 深绿色背景区域 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 -mx-6 px-6 py-6 rounded-lg border border-emerald-200">
                        <h2 className="text-lg font-bold text-emerald-800 border-b border-emerald-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">📍</span> 区域1: 页面顶部 (深绿色背景)
                        </h2>
                        <p className="text-sm text-emerald-600 mb-4 bg-white/50 p-3 rounded-lg">
                            这些内容显示在页面最上方的深绿色区域，包括店名、标语和评分
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Hero Title */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🏷️ 店名上方小标题 <span className="text-gray-400 font-normal">(heroTitle)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">例如: HOLIDAY FEAST、LIMITED TIME - 显示在店名正上方的小字</p>
                                <input
                                    type="text"
                                    value={formData.content.heroTitle || ''}
                                    onChange={(e) => updateContent('heroTitle', e.target.value)}
                                    placeholder="例如: HOLIDAY FEAST"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Business Name */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🏪 店名 (大标题) * <span className="text-gray-400 font-normal">(businessName)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">显示在页面最显眼位置的店铺名称</p>
                                <input
                                    type="text"
                                    value={formData.content.businessName || ''}
                                    onChange={(e) => {
                                        updateContent('businessName', e.target.value)
                                        handleNameChange(e.target.value)
                                    }}
                                    placeholder="例如: Tasty Restaurant"
                                    className="w-full border rounded px-3 py-2 text-lg font-semibold"
                                    required
                                />
                            </div>

                            {/* Hero Subtitle */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📝 店名下方副标题 <span className="text-gray-400 font-normal">(heroSubtitle)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">例如: Family Special、Since 1990 - 显示在店名正下方的描述文字</p>
                                <input
                                    type="text"
                                    value={formData.content.heroSubtitle || ''}
                                    onChange={(e) => updateContent('heroSubtitle', e.target.value)}
                                    placeholder="例如: Family Special"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ⭐ 评分 <span className="text-gray-400 font-normal">(rating)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">店铺评分，如 4.8</p>
                                <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="5"
                                    value={formData.content.rating || 4.8}
                                    onChange={(e) => updateContent('rating', parseFloat(e.target.value))}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Review Count */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    💬 评论数量 <span className="text-gray-400 font-normal">(reviewCount)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">如: "1.2k"、"500" - 显示在评分旁边</p>
                                <input
                                    type="text"
                                    value={formData.content.reviewCount || ''}
                                    onChange={(e) => updateContent('reviewCount', e.target.value)}
                                    placeholder="例如: 1.2k 或 500"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* 🎁 区域2: 折扣卡片 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 -mx-6 px-6 py-6 rounded-lg border border-orange-200">
                        <h2 className="text-lg font-bold text-orange-800 border-b border-orange-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">🎁</span> 区域2: 折扣卡片 (玻璃效果区域)
                        </h2>
                        <p className="text-sm text-orange-600 mb-4 bg-white/50 p-3 rounded-lg">
                            这是显示折扣信息的半透明卡片区域，包含折扣金额、描述和热度
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Offer Value */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    💰 折扣数值 * <span className="text-gray-400 font-normal">(offer.value)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">卡片上最大的数字，如 "20% OFF"、"$10 Off"</p>
                                <input
                                    type="text"
                                    value={formData.content.offer?.value || ''}
                                    onChange={(e) => updateContent('offer.value', e.target.value)}
                                    placeholder="例如: 20% OFF"
                                    className="w-full border rounded px-3 py-2 font-bold text-2xl text-orange-600"
                                    required
                                />
                            </div>

                            {/* Offer Type */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🏆 优惠类型 <span className="text-gray-400 font-normal">(offer.type)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">显示在折扣数值上方的小标签</p>
                                <input
                                    type="text"
                                    list="offer-type-options"
                                    value={formData.content.offer?.type || ''}
                                    onChange={(e) => updateContent('offer.type', e.target.value)}
                                    placeholder="选择或输入自定义类型"
                                    className="w-full border rounded px-3 py-2 bg-white"
                                />
                                <datalist id="offer-type-options">
                                    <option value="discount">不显示标签</option>
                                    <option value="Exclusive">Exclusive (独家)</option>
                                    <option value="Limited">Limited (限时)</option>
                                    <option value="Special">Special (特别)</option>
                                    <option value="Holiday">Holiday (节日)</option>
                                    <option value="VIP">VIP</option>
                                    <option value="Grand Opening">Grand Opening (开业)</option>
                                </datalist>
                            </div>

                            {/* Offer Description */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📄 折扣描述 <span className="text-gray-400 font-normal">(offer.description)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">折扣卡片上的详细说明文字</p>
                                <textarea
                                    value={formData.content.offer?.description || ''}
                                    onChange={(e) => updateContent('offer.description', e.target.value)}
                                    placeholder="例如: Get 20% OFF your entire bill when you dine with us."
                                    className="w-full border rounded px-3 py-2"
                                    rows={2}
                                />
                            </div>

                            {/* Badge Text */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🔥 角标文字 <span className="text-gray-400 font-normal">(offer_badge_text)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">卡片右下角的小标签，如 "HOT"</p>
                                <input
                                    type="text"
                                    value={formData.content.offer_badge_text || ''}
                                    onChange={(e) => updateContent('offer_badge_text', e.target.value)}
                                    placeholder="例如: HOT"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Virtual Base Count */}
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    👥 虚拟热度基数 <span className="text-gray-400 font-normal">(virtual_base_count)</span>
                                </label>
                                <p className="text-xs text-gray-500 mb-2">"XX claimed this week" 的虚拟数字</p>
                                <input
                                    type="number"
                                    value={formData.virtual_base_count || 200}
                                    onChange={(e) => setFormData({ ...formData, virtual_base_count: parseInt(e.target.value) || 0 })}
                                    placeholder="例如: 200"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* 📝 区域3: 表单区域 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 -mx-6 px-6 py-6 rounded-lg border border-blue-200">
                        <h2 className="text-lg font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">📝</span> 区域3: 领取表单区域
                        </h2>
                        <p className="text-sm text-blue-600 mb-4 bg-white/50 p-3 rounded-lg">
                            用户填写信息领取优惠券的白色卡片区域
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    📋 表单标题 <span className="text-gray-400 font-normal">(section_title_claim)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.content.customLabels?.section_title_claim || ''}
                                    onChange={(e) => updateContent('customLabels.section_title_claim', e.target.value)}
                                    placeholder="默认: Get Your Coupon"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    🔘 按钮文字 <span className="text-gray-400 font-normal">(button_text_claim)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.content.customLabels?.button_text_claim || ''}
                                    onChange={(e) => updateContent('customLabels.button_text_claim', e.target.value)}
                                    placeholder="默认: Claim Coupon Now"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Form Fields Control */}
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    📥 要收集的用户信息
                                </label>
                                <div className="flex flex-wrap gap-4">
                                    <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.content.requirements?.collectName ?? true}
                                            onChange={(e) => updateContent('requirements.collectName', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm">收集姓名 (Name)</span>
                                    </label>
                                    <label className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border cursor-pointer hover:bg-gray-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.content.requirements?.collectEmail ?? false}
                                            onChange={(e) => updateContent('requirements.collectEmail', e.target.checked)}
                                            className="h-4 w-4 text-blue-600 rounded"
                                        />
                                        <span className="text-sm">收集邮箱 (Email)</span>
                                    </label>
                                    <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg border">
                                        <input type="checkbox" checked disabled className="h-4 w-4 rounded" />
                                        <span className="text-sm text-gray-500">电话号码 (必填)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* ✅ 区域4: 成功页面 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 -mx-6 px-6 py-6 rounded-lg border border-green-200">
                        <h2 className="text-lg font-bold text-green-800 border-b border-green-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">✅</span> 区域4: 领取成功页面
                        </h2>
                        <p className="text-sm text-green-600 mb-4 bg-white/50 p-3 rounded-lg">
                            用户点击领取按钮后看到的成功页面内容
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    成功标题 <span className="text-gray-400 font-normal">(success_title)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.content.customLabels?.success_title || ''}
                                    onChange={(e) => updateContent('customLabels.success_title', e.target.value)}
                                    placeholder="默认: Coupon Claimed!"
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    成功副标题 <span className="text-gray-400 font-normal">(success_subtitle)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.content.customLabels?.success_subtitle || ''}
                                    onChange={(e) => updateContent('customLabels.success_subtitle', e.target.value)}
                                    placeholder="默认: Show this code to the staff."
                                    className="w-full border rounded px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* 📍 区域5: 底部商家信息卡片 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-slate-50 to-gray-100 -mx-6 px-6 py-6 rounded-lg border border-slate-200">
                        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">📍</span> 区域5: 底部商家信息卡片
                        </h2>
                        <p className="text-sm text-slate-600 mb-4 bg-white/50 p-3 rounded-lg">
                            页面底部的白色卡片，显示地址、营业时间、电话等联系方式
                        </p>

                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Visit Us Section */}
                            <div className="col-span-2 bg-white p-4 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-orange-500" /> Visit Us 地址
                                </h4>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            街道地址 <span className="text-gray-400 font-normal">(address.street)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.content.address?.street || ''}
                                            onChange={(e) => updateContent('address.street', e.target.value)}
                                            placeholder="例如: 123 Main Street"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            城市/区域 <span className="text-gray-400 font-normal">(address.area)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.content.address?.area || ''}
                                            onChange={(e) => updateContent('address.area', e.target.value)}
                                            placeholder="例如: San Francisco, CA"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            完整地址 (用于地图链接) * <span className="text-gray-400 font-normal">(address.fullAddress)</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.content.address?.fullAddress || ''}
                                            onChange={(e) => updateContent('address.fullAddress', e.target.value)}
                                            placeholder="例如: 123 Main St, San Francisco, CA 94102"
                                            className="w-full border rounded px-3 py-2 text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Opening Hours Section */}
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-orange-500" /> Opening Hours 营业时间
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        营业时间显示 <span className="text-gray-400 font-normal">(openingHours.specialHours)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.content.openingHours?.specialHours || ''}
                                        onChange={(e) => updateContent('openingHours.specialHours', e.target.value)}
                                        placeholder="例如: Mon-Sun 10 AM - 9 PM"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>

                            {/* Call Us Section */}
                            <div className="bg-white p-4 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-orange-500" /> Call Us 联系电话
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        电话号码 * <span className="text-gray-400 font-normal">(phone)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.content.phone || ''}
                                        onChange={(e) => updateContent('phone', e.target.value)}
                                        placeholder="例如: (555) 123-4567"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Website Section */}
                            <div className="col-span-2 bg-white p-4 rounded-lg border">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <Globe className="w-4 h-4 text-blue-500" /> Website 网站 (可选)
                                </h4>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        网站链接 <span className="text-gray-400 font-normal">(website)</span>
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.content.website || ''}
                                        onChange={(e) => updateContent('website', e.target.value)}
                                        placeholder="例如: https://www.example.com"
                                        className="w-full border rounded px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* 🏷️ 内部编号 */}
                    {/* ============================================================ */}
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 -mx-6 px-6 py-4 rounded-lg border border-purple-200">
                        <h2 className="text-lg font-bold text-purple-800 border-b border-purple-200 pb-2 mb-4 flex items-center gap-2">
                            <span className="text-xl">🏷️</span> 内部编号 (仅内部使用)
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                🔢 商家编号 <span className="text-gray-400 font-normal">(internal_id)</span>
                            </label>
                            <p className="text-xs text-gray-500 mb-2">例如: M001、SH-2024-001 等，由运营人员填写</p>
                            <input
                                type="text"
                                value={(formData as any).internal_id || ''}
                                onChange={(e) => setFormData({ ...formData, internal_id: e.target.value } as any)}
                                placeholder="例如: M001"
                                className="w-full border rounded px-3 py-2 font-mono text-lg"
                            />
                        </div>
                    </div>

                    {/* ============================================================ */}
                    {/* ⚙️ 系统设置 (折叠) */}
                    {/* ============================================================ */}
                    <details className="bg-gray-50 -mx-6 px-6 py-4 rounded-lg border border-gray-200">
                        <summary className="cursor-pointer text-lg font-bold text-gray-700 flex items-center gap-2">
                            <span className="text-xl">⚙️</span> 系统设置 (点击展开)
                        </summary>
                        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">内部名称 (Internal Name)</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="自动从店名生成"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    placeholder="自动从店名生成"
                                    className="w-full border rounded px-3 py-2"
                                />
                                <p className="text-xs text-gray-500 mt-1">落地页地址: updeal.top/{formData.slug || '...'}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-900">激活 (Active)</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">兑换PIN码 (Store Password)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.redeem_pin || ''}
                                        onChange={(e) => setFormData({ ...formData, redeem_pin: e.target.value })}
                                        placeholder="例如: 1234"
                                        className="w-full border rounded px-3 py-2 font-mono"
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
                                <p className="mt-1 text-xs text-gray-500">商家员工核销时使用的密码 (自动生成)</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GA4 ID (可选)</label>
                                <input
                                    type="text"
                                    value={formData.ga4_measurement_id || ''}
                                    onChange={(e) => setFormData({ ...formData, ga4_measurement_id: e.target.value })}
                                    placeholder="G-XXXXXXXXXX"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Pixel ID (可选)</label>
                                <input
                                    type="text"
                                    value={formData.meta_pixel_id || ''}
                                    onChange={(e) => setFormData({ ...formData, meta_pixel_id: e.target.value })}
                                    placeholder="例如: 1234567890"
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </details>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link
                            href="/admin/merchants"
                            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 bg-white"
                        >
                            取消
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? '创建中...' : '创建商家'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
