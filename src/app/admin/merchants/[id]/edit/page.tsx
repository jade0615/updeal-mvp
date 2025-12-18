'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { updateMerchant, getMerchant } from '@/actions/merchants'
import type { MerchantFormData } from '@/lib/utils/validation'
import Link from 'next/link'
import { Copy, ExternalLink, Check } from 'lucide-react'

export default function EditMerchantPage() {
    const router = useRouter()
    const params = useParams()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [origin, setOrigin] = useState('')

    // Initialize with default matching the new schema
    const [formData, setFormData] = useState<MerchantFormData>({
        name: '',
        slug: '',
        template_type: 'nail',
        logo_url: '',
        ga4_measurement_id: '',
        redeem_pin: '',
        is_active: true,
        content: {
            businessName: '',
            businessType: 'Restaurant',
            priceRange: '$$',
            establishedYear: 2020,
            logoUrl: '',
            rating: 4.5,
            reviewCount: '100',
            offer: {
                type: 'Exclusive',
                value: '10%',
                unit: 'Off',
                description: 'Special Offer',
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
            },
            reviews: [],
            // Legacy/Extra to avoid undefined errors
            heroTitle: '',
            heroSubtitle: '',
            heroImageUrl: '',
            features: [],
            galleryImages: [],
        }
    })

    useEffect(() => {
        setOrigin(window.location.origin)

        async function loadMerchant() {
            try {
                const merchant = await getMerchant(params.id as string)
                if (merchant) {
                    // Start with default content structure to ensure all nested objects exist
                    const defaultContent = {
                        businessName: merchant.name,
                        businessType: 'Restaurant',
                        priceRange: '$$',
                        establishedYear: 2020,
                        offer: {
                            type: 'Exclusive',
                            value: '',
                            unit: 'Off',
                            description: '',
                            totalLimit: 500
                        },
                        address: { street: '', area: '', fullAddress: '' },
                        openingHours: { isOpen: true, currentStatus: 'Open Now', closingTime: '10 PM' },
                        reviews: []
                    };

                    // Deep merge or overwrite defaults with actual data
                    const mergedContent = { ...defaultContent, ...merchant.content };
                    // Ensure nested objects like offer and address are also merged if they exist in merchant.content
                    if (merchant.content?.offer) mergedContent.offer = { ...defaultContent.offer, ...merchant.content.offer };
                    if (merchant.content?.address) mergedContent.address = { ...defaultContent.address, ...merchant.content.address };
                    if (merchant.content?.openingHours) mergedContent.openingHours = { ...defaultContent.openingHours, ...merchant.content.openingHours };

                    setFormData({
                        ...merchant,
                        content: mergedContent,
                        // @ts-ignore - explicitly keeping stats
                        landing_page_stats: merchant.landing_page_stats
                    })
                }
            } catch (err) {
                setError('Failed to load merchant')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        if (params.id) {
            loadMerchant()
        }
    }, [params.id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        const result = await updateMerchant(params.id as string, formData)

        if (result.success) {
            router.push('/admin/merchants')
        } else {
            setError(result.error || 'Failed to update merchant')
            setSaving(false)
        }
    }

    // Helper to update nested content fields
    const updateContent = (path: string, value: any) => {
        setFormData(prev => {
            const newContent = { ...prev.content };

            // Handle simple paths: "businessName"
            if (!path.includes('.')) {
                (newContent as any)[path] = value;
                return { ...prev, content: newContent };
            }

            // Handle nested paths: "offer.value" or "address.street"
            const [parent, child] = path.split('.');
            if (parent && child && (newContent as any)[parent]) {
                (newContent as any)[parent] = {
                    ...(newContent as any)[parent],
                    [child]: value
                };
            }
            return { ...prev, content: newContent };
        });
    }

    const CopyButton = ({ text }: { text: string }) => {
        const [copied, setCopied] = useState(false)
        const handleCopy = () => {
            navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
        return (
            <button
                type="button"
                onClick={handleCopy}
                className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                title="Copy to clipboard"
            >
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            </button>
        )
    }

    if (loading) return <div className="p-8">Loading...</div>

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
                                Merchants
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Merchant</h1>
                        <p className="text-gray-600 mt-1">Update merchant details and landing page content.</p>
                    </div>
                    <a href={`/${formData.slug}`} target="_blank" className="text-blue-600 hover:underline">
                        View Landing Page ↗
                    </a>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {/* === QUICK LINKS CARD === */}
                <div className="bg-white shadow rounded-lg p-6 mb-6 ring-1 ring-blue-100">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                        🚀 Quick Links
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {/* Landing Page Link */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <label className="block text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
                                Customer Landing Page
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={`${origin}/${formData.slug}`}
                                    className="flex-1 bg-white border-blue-200 text-sm text-gray-600 rounded px-3 py-2 outline-none"
                                />
                                <CopyButton text={`${origin}/${formData.slug}`} />
                                <a
                                    href={`/${formData.slug}`}
                                    target="_blank"
                                    className="p-2 text-blue-600 hover:text-blue-800"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                            <p className="mt-2 text-xs text-blue-600">
                                Share this link with customers to claim offers.
                            </p>
                        </div>

                        {/* Store Redeem Link */}
                        <div className="bg-purple-50 rounded-lg p-4">
                            <label className="block text-xs font-bold text-purple-800 uppercase tracking-wide mb-2">
                                Merchant Redemption Portal
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    readOnly
                                    value={`${origin}/store-redeem/${formData.slug}`}
                                    className="flex-1 bg-white border-purple-200 text-sm text-gray-600 rounded px-3 py-2 outline-none"
                                />
                                <CopyButton text={`${origin}/store-redeem/${formData.slug}`} />
                                <a
                                    href={`/store-redeem/${formData.slug}`}
                                    target="_blank"
                                    className="p-2 text-purple-600 hover:text-purple-800"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                            </div>
                            <p className="mt-2 text-xs text-purple-600">
                                Give this link to staff to verify/redeem coupons.
                            </p>
                        </div>
                    </div>
                </div>

                {/* === ANALYTICS CARD === */}
                <div className="bg-white shadow rounded-lg p-6 mb-6 ring-1 ring-indigo-100">
                    <h2 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                        📊 Live Analytics
                    </h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 text-center">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase">Page Views</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                                {(() => {
                                    // @ts-ignore
                                    const stats = formData.landing_page_stats;
                                    const s = Array.isArray(stats) ? stats[0] : stats;
                                    return (s?.total_page_views || 0).toLocaleString();
                                })()}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase">Claims</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                                {(() => {
                                    // @ts-ignore
                                    const stats = formData.landing_page_stats;
                                    const s = Array.isArray(stats) ? stats[0] : stats;
                                    return (s?.total_coupon_claims || 0).toLocaleString();
                                })()}
                            </p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs font-bold text-gray-500 uppercase">Conversion</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">
                                {(() => {
                                    // @ts-ignore
                                    const stats = formData.landing_page_stats;
                                    const s = Array.isArray(stats) ? stats[0] : stats;
                                    return (s?.conversion_rate || 0) + '%';
                                })()}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-8">
                    {/* === 1. System Info === */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">System Info</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Internal Name *</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">URL Slug *</label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <div className="flex items-center mt-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                    />
                                    <span className="ml-2 text-sm text-gray-900">Active</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">GA4 ID</label>
                                <input
                                    type="text"
                                    value={formData.ga4_measurement_id || ''}
                                    onChange={(e) => setFormData({ ...formData, ga4_measurement_id: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === Security / Access === */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Security / Access</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Redemption PIN (Store Password)</label>
                                <input
                                    type="text"
                                    value={formData.redeem_pin || ''}
                                    onChange={(e) => setFormData({ ...formData, redeem_pin: e.target.value })}
                                    placeholder="e.g. 1234"
                                    className="w-full border rounded px-3 py-2 font-mono"
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Used by merchant staff to access the redemption terminal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* === 2. Business Basic Info === */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Business Info (Public)</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Name (Display Name) *</label>
                                <input
                                    type="text"
                                    value={formData.content.businessName || ''}
                                    onChange={(e) => updateContent('businessName', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type (e.g. Italian Cuisine)</label>
                                <input
                                    type="text"
                                    value={formData.content.businessType || ''}
                                    onChange={(e) => updateContent('businessType', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                                <select
                                    value={formData.content.priceRange || '$$'}
                                    onChange={(e) => updateContent('priceRange', e.target.value)}
                                    className="w-full border rounded px-3 py-2 bg-white"
                                >
                                    <option value="$">$</option>
                                    <option value="$$">$$</option>
                                    <option value="$$$">$$$</option>
                                    <option value="$$$$">$$$$</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Established Year</label>
                                <input
                                    type="number"
                                    value={formData.content.establishedYear || 2020}
                                    onChange={(e) => updateContent('establishedYear', parseInt(e.target.value))}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                                <input
                                    type="url"
                                    value={formData.content.logoUrl || ''}
                                    onChange={(e) => updateContent('logoUrl', e.target.value)}
                                    placeholder="https://..."
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === 3. Offer Details === */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Offer Details</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Offer Value *</label>
                                <input
                                    type="text"
                                    value={formData.content.offer?.value || ''}
                                    onChange={(e) => updateContent('offer.value', e.target.value)}
                                    placeholder="e.g. 50% or $10"
                                    className="w-full border rounded px-3 py-2 font-bold text-indigo-600"
                                    required
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                <select
                                    value={formData.content.offer?.unit || 'Off'}
                                    onChange={(e) => updateContent('offer.unit', e.target.value)}
                                    className="w-full border rounded px-3 py-2 bg-white"
                                >
                                    <option value="Off">Off</option>
                                    <option value="Free">Free</option>
                                    <option value="Off Your Order">Off Your Order</option>
                                    <option value="">None</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type (Badge)</label>
                                <input
                                    type="text"
                                    value={formData.content.offer?.type || 'Exclusive'}
                                    onChange={(e) => updateContent('offer.type', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="col-span-3">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    value={formData.content.offer?.description || ''}
                                    onChange={(e) => updateContent('offer.description', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Total Limit</label>
                                <input
                                    type="number"
                                    value={formData.content.offer?.totalLimit || 500}
                                    onChange={(e) => updateContent('offer.totalLimit', parseInt(e.target.value))}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === 4. Location & Contact === */}
                    <div>
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Location & Contact</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                                <input
                                    type="text"
                                    value={formData.content.address?.street || ''}
                                    onChange={(e) => updateContent('address.street', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Area / City</label>
                                <input
                                    type="text"
                                    value={formData.content.address?.area || ''}
                                    onChange={(e) => updateContent('address.area', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Address (for Maps Link)</label>
                                <input
                                    type="text"
                                    value={formData.content.address?.fullAddress || ''}
                                    onChange={(e) => updateContent('address.fullAddress', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    value={formData.content.phone || ''}
                                    onChange={(e) => updateContent('phone', e.target.value)}
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6 border-t">
                        <Link
                            href="/admin/merchants"
                            className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 bg-white"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? 'Save Changes' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
