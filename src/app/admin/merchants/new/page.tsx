'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createMerchant, generateSlug } from '@/actions/merchants'
import type { MerchantFormData } from '@/lib/utils/validation'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'

// Enhanced Presets with robust defaults
const PRESETS: Record<string, Partial<MerchantFormData>> = {
  sushi: {
    template_type: 'sushi',
    content: {
      businessName: '', // Placeholder
      businessType: 'Restaurant',
      heroTitle: 'Grand Opening',
      heroSubtitle: 'Taste the Freshness',
      heroImageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=2070&auto=format&fit=crop',
      offer_type: 'discount',
      offerTitle: 'Grand Opening Special',
      offerDescription: 'Get 20% OFF your entire bill when you dine with us. Valid for a limited time!',
      offer_value: '20% OFF',
      offer_badge_text: 'LIMITED TIME',
      primaryColor: '#F43F5E',
      openingHours: { isOpen: true, currentStatus: 'Open Daily', closingTime: '10:00 PM' }
    }
  },
  nail: {
    template_type: 'nail',
    content: {
      businessName: '',
      businessType: 'Beauty & Spa',
      heroTitle: 'Luxury Manicure',
      heroSubtitle: 'Treat Yourself Today',
      heroImageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=2070&auto=format&fit=crop',
      offer_type: 'discount',
      offerTitle: 'New Customer Special',
      offerDescription: 'Get $10 OFF your first Gel Manicure or Pedi Spa usage.',
      offer_value: '$10 OFF',
      offer_badge_text: 'NEW CLIENTS',
      primaryColor: '#D946EF',
      openingHours: { isOpen: true, currentStatus: 'Open Now', closingTime: '7:00 PM' }
    }
  },
  massage: {
    template_type: 'massage',
    content: {
      businessName: '',
      businessType: 'Wellness',
      heroTitle: 'Relax & Rejuvenate',
      heroSubtitle: 'Professional Massage Therapy',
      heroImageUrl: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop',
      offer_type: 'discount',
      offerTitle: '60-Min Massage Deal',
      offerDescription: 'Complete relaxation for mind and body. Book your session today.',
      offer_value: '$49 ONLY',
      offer_badge_text: 'HOT DEAL',
      primaryColor: '#0EA5E9',
      openingHours: { isOpen: true, currentStatus: 'Open Daily', closingTime: '9:00 PM' }
    }
  },
  entertainment: {
    template_type: 'sushi', // Fallback to compatible template
    content: {
      businessName: '',
      businessType: 'Entertainment',
      heroTitle: 'Fun for Everyone',
      heroSubtitle: 'Arcade & Games',
      heroImageUrl: 'https://images.unsplash.com/photo-1511882150382-421056c89033?q=80&w=2071&auto=format&fit=crop',
      offer_type: 'bogo',
      offerTitle: 'Buy 1 Get 1 Free',
      offerDescription: 'Buy one hour of play time and get the second hour absolutely FREE!',
      offer_value: 'BOGO FREE',
      offer_badge_text: 'POPULAR',
      primaryColor: '#8B5CF6',
      openingHours: { isOpen: true, currentStatus: 'Open Late', closingTime: '11:00 PM' }
    }
  }
}

export default function NewMerchantPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedPreset, setSelectedPreset] = useState('sushi')

  const [formData, setFormData] = useState<MerchantFormData>({
    name: '',
    slug: '',
    template_type: 'sushi',
    logo_url: '',
    ga4_measurement_id: '',
    virtual_base_count: 200, // UX requirement: Default to realistic number
    is_active: true,
    content: {
      // Default fallback content is critical if user picks 'sushi' immediately
      ...PRESETS['sushi'].content as any,
      businessName: '',
      phone: '',
      address: { street: '', area: '', fullAddress: '' },
      website: '',
      requirements: { collectName: true, collectEmail: false }
    }
  })

  // Auto-generate PIN and Virtual Heat on mount
  useEffect(() => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString()
    const randomHeat = Math.floor(120 + Math.random() * 300)
    setFormData(prev => ({
      ...prev,
      redeem_pin: randomPin,
      virtual_base_count: randomHeat
    }))
  }, [])

  // Sync Preset Changes
  useEffect(() => {
    const preset = PRESETS[selectedPreset]
    if (preset && preset.content) {
      setFormData(prev => ({
        ...prev,
        template_type: preset.template_type as any,
        content: {
          ...prev.content,
          ...preset.content,
          // Preserve user-entered critical info
          businessName: prev.content.businessName,
          phone: prev.content.phone,
          address: prev.content.address,
          openingHours: prev.content.openingHours // Keep hours if modified, else preset overwrites? Let's check.
          // Actually simple approach: Preset overwrites aesthetics, keeps identity.
        }
      }))
    }
  }, [selectedPreset])

  const handleNameChange = async (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      content: {
        ...prev.content,
        businessName: name // Sync business name
      }
    }))

    // Auto-generate slug with debounce/check
    if (name && name.length > 2) {
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
    setLoading(true)
    setError('')

    try {
      const result = await createMerchant(formData)

      if (result.success) {
        // Feature: Redirect to Visual Editor
        const editUrl = `/${result.merchant?.slug}?mode=edit&new=true`
        router.push(editUrl)
      } else {
        setError(result.error || 'Failed to create merchant')
        setLoading(false)
      }
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Merchant</h1>
          <p className="text-gray-600 mt-2">Simplify your setup. Details can be edited visually later.</p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          {/* Template Selector Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
            <label className="block text-sm font-medium mb-2 opacity-90">Select Industry / Template</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'sushi', label: '🍣 Restaurant' },
                { id: 'nail', label: '💅 Beauty/Nail' },
                { id: 'massage', label: '💆 Massage' },
                { id: 'entertainment', label: '🎮 Fun/Arcade' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedPreset(t.id)}
                  className={`py-2 px-1 text-xs sm:text-sm rounded-lg border transition-all ${selectedPreset === t.id
                    ? 'bg-white text-blue-700 border-white font-bold shadow-lg ring-2 ring-blue-300 ring-opacity-50'
                    : 'bg-blue-800/30 border-transparent hover:bg-blue-600 text-white'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            {/* Core Fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Business Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-3 px-4 text-lg"
                placeholder="e.g. Tasty Bistro"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">This will be the main title of your page.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={formData.content.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: { ...prev.content, phone: e.target.value } }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                  placeholder="(555) 123-4567"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Used for the "Call Us" button.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Opening Hours (Display)</label>
                <input
                  type="text"
                  value={formData.content.openingHours?.currentStatus || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev, content: {
                      ...prev.content,
                      openingHours: { ...(prev.content.openingHours || {}), currentStatus: e.target.value }
                    }
                  }))}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                  placeholder="e.g. Open Mon-Sun 10AM-9PM"
                />
                <p className="text-xs text-gray-500 mt-1">Displayed in the "Info" card.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
              <input
                type="text"
                value={formData.content.address?.fullAddress || ''}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  content: {
                    ...prev.content,
                    address: { ...(prev.content.address || {}), fullAddress: e.target.value, street: e.target.value } // Lazy sync street
                  }
                }))}

                className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 py-2 px-3"
                placeholder="123 Main St, New York, NY 10001"
                required
              />
              <p className="text-xs text-gray-500 mt-1">This will be used for Google Maps links.</p>
            </div>

            {/* Hidden Logic / Summary */}
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-500 flex justify-between items-center">
              <div>
                <p><strong>URL:</strong> /{formData.slug || '...'}</p>
                <p><strong>PIN:</strong> {formData.redeem_pin}</p>
              </div>
              <div className="text-right">
                <p><strong>Heat:</strong> +{formData.virtual_base_count} views</p>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-[1.01]"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : '✨ Generate Landing Page'}
              </button>
              <div className="text-center mt-4">
                <Link href="/admin/merchants" className="text-sm text-gray-500 hover:text-gray-700">Cancel & Return to Dashboard</Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
