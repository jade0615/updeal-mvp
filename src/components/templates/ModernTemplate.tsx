'use client'

import { TemplateProps } from './index'
import { useState, useEffect } from 'react'
import Link from 'next/link'


// Helper: Generate colorful avatar
function generateAvatar(name: string, size = 100) {
    const colors = ['0D9488', '059669', '0891B2', '6366F1', 'EC4899', 'F59E0B']
    const cleanName = name || 'User'
    const randomColor = colors[Math.abs(cleanName.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % colors.length]
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=${randomColor}&color=fff&size=${size}&bold=true`
}

// Helper: Generate random names for social proof
function generateRandomNames(count: number) {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'James', 'Sophia', 'William', 'Isabella', 'Oliver', 'Mia', 'Benjamin', 'Charlotte', 'Lucas']
    const lastInitials = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M']
    const names = []
    for (let i = 0; i < count; i++) {
        const first = firstNames[Math.floor(Math.random() * firstNames.length)]
        const last = lastInitials[Math.floor(Math.random() * lastInitials.length)]
        names.push(`${first} ${last}`)
    }
    return names
}

export default function ModernTemplate({ merchant, claimedCount }: TemplateProps) {
    const { content } = merchant
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')
    const [name, setName] = useState('') // Added Name field as per design
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [couponData, setCouponData] = useState<any>(null)

    // Client-side only random names to avoid hydration mismatch
    const [socialNames, setSocialNames] = useState<string[]>([])

    useEffect(() => {
        setSocialNames(generateRandomNames(3))
    }, [])

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
                    email,
                    name // Pass name if backend supports it, otherwise it's just frontend UX
                })
            })

            if (res.ok) {
                const data = await res.json()
                setCouponData(data.coupon)
                setSuccess(true)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Dynamic fields (optional in interface, so allow defaults)
    const reviewsCount = content.reviewsCount || '1.2k'
    const category = content.category || 'Italian Cuisine'
    const priceRange = content.priceRange || '$$$'
    const yearEstablished = content.yearEstablished || '2016'

    // Address handling
    const fullAddress = content.address || '123 Culinary Avenue, Food District, NY'
    const shortAddress = fullAddress.split(',').slice(0, 2).join(', ')

    // Extract display values
    // Extract display values
    const primaryOffer = content.offer_value || content.offerDiscount || '50%'
    const discountStart = primaryOffer.replace(/%|\s*OFF|\$/gi, '').trim()
    const discountEnd = primaryOffer.includes('%') ? '%' : (primaryOffer.includes('$') ? '$' : '')
    // If it has '$', usually it's prefix. Logic here is simple: if %, suffix. If pure number, assume %.
    const isCurrency = primaryOffer.includes('$')
    const displayValue = isCurrency ? `$${discountStart}` : `${discountStart}${discountEnd}`

    const offerSuffix = content.offerDiscount?.toLowerCase().includes('off') ? 'OFF' : (content.offer_type === 'discount' ? 'OFF' : '')

    return (
        <div className="flex justify-center py-4 sm:py-8 min-h-[100dvh] bg-gray-100 font-sans">
            <div className="w-full max-w-[420px] md:max-w-[512px] lg:max-w-[576px] bg-theme-bg relative shadow-2xl overflow-hidden sm:rounded-[3rem] md:rounded-[24px] border-theme-border sm:border-[8px] sm:border-gray-900 min-h-[850px] flex flex-col md:my-8 lg:my-12 md:shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#FAFAF9] to-[#F5F5F4] -z-10"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-theme-accentSoft rounded-full blur-[120px] opacity-60 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

                {/* Header */}
                <header className="relative px-4 pt-8 pb-4 md:px-6 lg:px-8 z-30 flex justify-between items-center">
                    <div className="flex items-center gap-2.5 bg-white/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-theme-border/50">
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-theme-accent shadow-sm flex items-center justify-center">
                            <span className="text-white text-[10px] font-bold">U</span>
                        </div>
                        <span className="font-semibold text-theme-secondary text-xs tracking-wide uppercase">UpDeal</span>
                    </div>
                    <div className="flex gap-3">
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-theme-tertiary hover:text-red-500 hover:shadow-md transition-all border border-theme-border/50">
                            <span className="material-symbols-outlined text-[20px]">favorite</span>
                        </button>
                        <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-theme-tertiary hover:text-theme-accent hover:shadow-md transition-all border border-theme-border/50">
                            <span className="material-symbols-outlined text-[20px]">ios_share</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar relative z-20 pb-10">
                    {/* Merchant Hero */}
                    <div className="px-6 flex flex-col items-center text-center mt-2">

                        {/* Logo with fallback */}
                        <div className="relative mb-4 group cursor-pointer">
                            <div className="w-[88px] h-[88px] rounded-full p-1 bg-white shadow-soft relative z-10">
                                <img
                                    alt={content.heroTitle}
                                    className="w-full h-full object-cover rounded-full"
                                    src={content.heroImageUrl || generateAvatar(content.heroTitle, 200)}
                                    onError={(e) => {
                                        e.currentTarget.src = generateAvatar(content.heroTitle, 200)
                                    }}
                                />
                            </div>
                            <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm z-20 border border-theme-bg">
                                <span className="material-symbols-outlined filled text-blue-500 text-[18px]">verified</span>
                            </div>
                        </div>

                        <h1 className="text-[1.5rem] md:text-[1.75rem] lg:text-[2rem] font-serif font-bold text-theme-primary leading-tight mb-1">
                            {content.heroTitle}
                        </h1>

                        {/* Tags & Rating */}
                        <div className="flex flex-wrap items-center justify-center gap-2 text-sm mt-3 mb-2">
                            <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md shadow-sm border border-theme-border/50">
                                <span className="material-symbols-outlined filled text-amber-400 text-[16px]">star</span>
                                <span className="font-semibold text-theme-primary">{content.rating || '4.8'}</span>
                                <span className="text-theme-tertiary text-xs">({reviewsCount})</span>
                            </div>
                            <span className="text-theme-tertiary text-xs">•</span>
                            <span className="text-theme-secondary font-medium">{category}</span>
                            <span className="text-theme-tertiary text-xs">•</span>
                            <span className="text-theme-secondary font-medium">{priceRange}</span>
                        </div>

                        {/* Top Address - Short Version */}
                        {fullAddress && (
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-theme-secondary hover:text-theme-accent transition-colors mt-1 mb-3"
                            >
                                <span className="material-symbols-outlined text-[16px]">location_on</span>
                                <span className="text-xs font-medium">{shortAddress}</span>
                            </a>
                        )}

                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100/50 text-stone-500 text-[11px] font-medium tracking-wide uppercase">
                            <span className="material-symbols-outlined text-[14px]">history_edu</span>
                            Est. {yearEstablished}
                        </div>
                    </div>

                    {/* Discount Card */}
                    <div className="px-5 mt-8 relative">
                        <div className="absolute -top-10 right-8 w-16 h-16 z-0 opacity-90 transition-transform duration-500 hover:-translate-y-1 rotate-6">
                            <img
                                alt="Mascot Peeking"
                                className="w-full h-full object-contain drop-shadow-sm filter grayscale-[0.2]"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB6JP9Fnu4VqHDwUBatMng_X89mNstGVCEAsGOynZMA-e1M0hfFe_fKzYIJOMaiUgKBhGM13jyxGhCqXoi_3jI_MeuSbsFK4TDkjgyhlFEQfA0ULB9DZHWJtbg664ONGCJlj5QOQUEBlxhp4c11z2ZpGu1UcqaxeTclqf4awC3_Qbb2PClWLX2gf0trYjklcRn-dufeoXSS0SWnf2Bk1dk6t5XABZ1K-jGUDIryBZEMAtCqUzHclDpc2rzRJyDE4B2D8lxk3DZipRg"
                            />
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-soft relative z-10 border border-theme-border overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-theme-accentSoft rounded-bl-full opacity-50 -z-10"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-stone-50 rounded-tr-full opacity-50 -z-10"></div>

                            <div className="flex justify-between items-start mb-1">
                                <span className="bg-theme-accent text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">{content.offer_badge_text || content.offer_type || 'Exclusive'}</span>
                                <div className="text-right">
                                    <span className="block text-[10px] text-theme-tertiary uppercase tracking-wide">Expires soon</span>
                                </div>
                            </div>

                            {success ? (
                                // Success State - Redesigned prominent card
                                <div className="text-center py-8">
                                    <h3 className="text-2xl font-bold text-theme-primary mb-2">Claimed Successfully!</h3>

                                    <div className="mt-6 p-8 bg-stone-50 rounded-[2rem] border-2 border-dashed border-theme-accent/30 shadow-inner relative group">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-theme-accent text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.3em]">
                                            Redemption Code
                                        </div>

                                        <div className="py-6">
                                            <code className="text-5xl font-mono font-black text-theme-primary tracking-[0.15em] drop-shadow-sm">
                                                {couponData?.code}
                                            </code>
                                        </div>

                                        <div className="mt-4 pt-6 border-t border-stone-200/60">
                                            <p className="text-theme-secondary text-[11px] font-black uppercase tracking-widest leading-relaxed">
                                                Show this code to staff<br />
                                                to redeem your offer
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex flex-col items-center gap-2">
                                        <p className="text-theme-tertiary text-xs">Valid for 30 days from today</p>
                                        <div className="flex gap-3 text-[10px] text-theme-tertiary/60 decoration-theme-tertiary/20 underline-offset-4 mt-2">
                                            <Link
                                                href={`/privacy-policy?slug=${merchant.slug}`}
                                                className="hover:text-theme-accent transition-colors underline"
                                            >
                                                Privacy Policy
                                            </Link>
                                            <span>|</span>
                                            <Link
                                                href={`/terms-of-service?slug=${merchant.slug}`}
                                                className="hover:text-theme-accent transition-colors underline"
                                            >
                                                Terms of Service
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Offer State
                                <>
                                    <div className="text-center py-6">
                                        <div className="flex items-baseline justify-center gap-2 text-theme-primary">
                                            <span className="font-serif text-[3rem] md:text-[4rem] lg:text-[5rem] font-medium tracking-tighter">{displayValue}</span>
                                            {offerSuffix && <span className="font-light text-2xl text-theme-secondary uppercase tracking-widest">{offerSuffix}</span>}
                                        </div>
                                        <p className="text-theme-secondary text-sm mt-2 font-light">{content.offerDescription}</p>
                                    </div>

                                    <div className="border-t border-dashed border-theme-border pt-4 mt-2">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="material-symbols-outlined text-theme-accent text-[18px]">local_fire_department</span>
                                                <span className="text-xs font-semibold text-theme-secondary">{claimedCount > 100 ? `🔥 已有 ${claimedCount} 人疯抢` : (claimedCount > 0 ? `${claimedCount} Claimed` : '🔥 今日热门优惠')}</span>
                                            </div>

                                            {/* Avatars - Generated */}
                                            <div className="flex -space-x-2">
                                                {socialNames.map((n, i) => (
                                                    <img
                                                        key={i}
                                                        src={generateAvatar(n, 50)}
                                                        alt={n}
                                                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                                                    />
                                                ))}
                                                {claimedCount > 3 && (
                                                    <div className="h-6 w-6 rounded-full ring-2 ring-white bg-stone-100 flex items-center justify-center text-[9px] font-bold text-theme-secondary">
                                                        +{claimedCount - 3}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-theme-accent w-[75%] rounded-full relative shimmer-effect overflow-hidden"></div>
                                        </div>
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-[10px] text-theme-tertiary">Limited quantity available</span>
                                            <span className="text-[10px] text-theme-accent font-medium">High demand</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    {!success && (
                        <div className="px-5 mt-8 space-y-4">
                            <form onSubmit={handleClaim} className="space-y-3">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-theme-tertiary">
                                        <span className="material-symbols-outlined text-[20px]">person</span>
                                    </div>
                                    <input
                                        className="w-full bg-white border border-transparent focus:bg-white ring-1 ring-theme-border rounded-xl pl-11 pr-4 py-3.5 text-theme-primary placeholder-theme-tertiary text-sm focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent outline-none transition-all shadow-sm"
                                        placeholder="Full Name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-theme-tertiary">
                                            <span className="material-symbols-outlined text-[20px]">smartphone</span>
                                        </div>
                                        <input
                                            className="w-full bg-white border border-transparent focus:bg-white ring-1 ring-theme-border rounded-xl pl-11 pr-4 py-3.5 text-theme-primary placeholder-theme-tertiary text-sm focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent outline-none transition-all shadow-sm"
                                            placeholder="Phone (Required)"
                                            type="tel"
                                            required
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                        />
                                    </div>
                                    <div className="relative flex-1">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-theme-tertiary">
                                            <span className="material-symbols-outlined text-[20px]">mail</span>
                                        </div>
                                        <input
                                            className="w-full bg-white border border-transparent focus:bg-white ring-1 ring-theme-border rounded-xl pl-11 pr-4 py-3.5 text-theme-primary placeholder-theme-tertiary text-sm focus:ring-2 focus:ring-theme-accent/20 focus:border-theme-accent outline-none transition-all shadow-sm"
                                            placeholder="Email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-theme-primary hover:bg-stone-800 text-white font-medium text-[16px] py-3.5 sm:py-4 rounded-xl shadow-float transform transition active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    <span className="font-serif tracking-wide">{loading ? 'Processing...' : 'Claim Offer'}</span>
                                    {!loading && <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">arrow_forward</span>}
                                </button>
                                <p className="text-center text-[10px] text-theme-tertiary">Terms & conditions apply. Data secured.</p>
                                <div className="flex justify-center gap-3 mt-6 text-[10px] text-theme-tertiary/60 decoration-theme-tertiary/20 underline-offset-4">
                                    <Link
                                        href={`/privacy-policy?slug=${merchant.slug}`}
                                        className="hover:text-theme-accent transition-colors underline"
                                    >
                                        Privacy Policy
                                    </Link>
                                    <span>|</span>
                                    <Link
                                        href={`/terms-of-service?slug=${merchant.slug}`}
                                        className="hover:text-theme-accent transition-colors underline"
                                    >
                                        Terms of Service
                                    </Link>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Info Section */}
                    <div className="px-5 mt-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-theme-border divide-y divide-stone-50">
                            {/* Hours (Placeholder) */}
                            <div className="p-4 flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-orange-50/80 text-orange-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">schedule</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <h3 className="text-sm font-semibold text-theme-primary">Open Now</h3>
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                                    </div>
                                    <p className="text-xs text-theme-secondary">Closes 10 PM • Happy Hour 5-7 PM</p>
                                </div>
                            </div>

                            {/* Detailed Address */}
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(fullAddress)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-stone-50 transition-colors group block"
                            >
                                <div className="w-8 h-8 rounded-full bg-stone-50 text-theme-secondary group-hover:bg-white group-hover:shadow-sm flex items-center justify-center flex-shrink-0 transition-all mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-theme-primary group-hover:text-theme-accent transition-colors">{fullAddress}</h3>
                                    <p className="text-xs text-theme-secondary mt-0.5">Click for directions</p>
                                </div>
                                <div className="self-center text-theme-tertiary group-hover:text-theme-accent transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">directions</span>
                                </div>
                            </a>

                            {/* Phone */}
                            <a
                                href={`tel:${content.phone?.replace(/[^0-9+]/g, '')}`}
                                className="p-4 flex items-start gap-4 cursor-pointer hover:bg-stone-50 transition-colors group block"
                            >
                                <div className="w-8 h-8 rounded-full bg-stone-50 text-theme-secondary group-hover:bg-white group-hover:shadow-sm flex items-center justify-center flex-shrink-0 transition-all mt-0.5">
                                    <span className="material-symbols-outlined text-[18px]">call</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-semibold text-theme-primary group-hover:text-theme-accent transition-colors">{content.phone || 'Phone not available'}</h3>
                                    <p className="text-xs text-theme-secondary mt-0.5">Reservations & Inquiries</p>
                                </div>
                                <div className="self-center text-theme-tertiary group-hover:text-theme-accent transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">phone_in_talk</span>
                                </div>
                            </a>
                        </div>
                    </div>

                    {/* Guest Experiences / Reviews */}
                    {content.features && content.features.length > 0 && (
                        <div className="mt-8 pb-4">
                            <div className="flex justify-between items-center px-6 mb-4">
                                <h3 className="text-lg font-serif font-bold text-theme-primary">Guest Experiences</h3>
                                <a href="#" className="text-xs font-medium text-theme-accent hover:text-theme-secondary transition flex items-center gap-0.5">
                                    See All <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </a>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-6 snap-x">
                                {content.features.map((review: any, i: number) => (
                                    <div key={i} className="snap-center min-w-[260px] bg-white p-5 rounded-xl border border-theme-border shadow-clean flex flex-col justify-between">
                                        <div>
                                            <div className="flex text-amber-400 text-[14px] mb-3 gap-0.5">
                                                {[1, 2, 3, 4, 5].map(s => <span key={s} className="material-symbols-outlined filled">star</span>)}
                                            </div>
                                            <p className="text-xs text-theme-secondary leading-relaxed mb-4 line-clamp-3">"{review.description}"</p>
                                        </div>
                                        <div className="flex items-center gap-3 pt-3 border-t border-stone-50">
                                            <img
                                                src={generateAvatar(review.title, 50)}
                                                alt={review.title}
                                                className="w-8 h-8 rounded-full object-cover ring-2 ring-stone-50"
                                            />
                                            <div>
                                                <p className="text-xs font-bold text-theme-primary">{review.title}</p>
                                                <p className="text-[10px] text-theme-tertiary">Verified Customer</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* Material Symbols Import */}
            <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        </div>
    )
}
