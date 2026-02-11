'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Heart, Share, Star, ShieldCheck, Clock, MapPin,
    Tag, ArrowRight, Phone, Check, X, Globe, Calendar, Edit2, Save, XCircle
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Merchant } from '@/types/merchant';
import { updateMerchant } from '@/actions/merchants';
import confetti from 'canvas-confetti';
import { AppleWalletButton } from '@/components/ui/AppleWalletButton';

interface Props {
    merchant: Merchant;
    claimedCount: number;
    canEdit?: boolean;
}

// MASTER TOGGLE: Set to false to completely hide and disable the visual editor for everyone
const ENABLE_VISUAL_EDITOR = false;

export default function MobilePremiumTemplate({ merchant: initialMerchant, claimedCount, canEdit = false }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verifiedPhone = searchParams.get('phone') || searchParams.get('p');

    // Visual Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(initialMerchant);
    const [isSaving, setIsSaving] = useState(false);

    // Auto-trigger Edit Mode from URL (only if enabled and permitted)
    useEffect(() => {
        if (ENABLE_VISUAL_EDITOR && canEdit && searchParams.get('mode') === 'edit') {
            setIsEditing(true);
        }
    }, [canEdit, searchParams]);

    // Sync if initialMerchant changes (revalidation)
    useEffect(() => {
        setData(initialMerchant);
    }, [initialMerchant]);

    // Helper: Update Content - supports all paths including nested objects
    const updateContent = (path: string, value: any) => {
        setData(prev => {
            const newContent = { ...prev.content };

            // Handle different path patterns
            if (path.startsWith('customLabels.')) {
                const key = path.split('.')[1];
                newContent.customLabels = {
                    ...newContent.customLabels,
                    [key]: value
                };
            } else if (path.includes('.')) {
                // Nested path support: "offer.value", "address.fullAddress"
                const [parent, child] = path.split('.');
                const contentObj = newContent as any;
                if (parent && child) {
                    // Initialize parent if it doesn't exist (e.g., legacy merchants)
                    if (!contentObj[parent]) {
                        contentObj[parent] = {};
                    }
                    contentObj[parent] = {
                        ...contentObj[parent],
                        [child]: value
                    };
                }
            } else {
                // Top-level property: "businessName", "heroTitle"
                (newContent as any)[path] = value;
            }
            return { ...prev, content: newContent };
        });
    };

    // Helper: Save Changes
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateMerchant(data.id, data as any); // Cast because of slight type mismatches if any
            setIsEditing(false);
            router.refresh();
        } catch (error) {
            alert('Failed to save changes');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper Component: Editable Label with improved visibility
    const EditableLabel = ({
        path,
        value,
        params = {},
        fallback = '',
        className = '',
        as = 'input',
        darkBg = false  // New prop for dark background styling
    }: {
        path: string,
        value?: string | null,
        params?: Record<string, string>,
        fallback?: string,
        className?: string,
        as?: 'input' | 'textarea',
        darkBg?: boolean
    }) => {
        // 注意：空字符串 "" 是有效值，不应该被 fallback 替代
        const displayValue = value !== undefined && value !== null ? value : fallback;

        if (!isEditing) {
            return <>{displayValue}</>;
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            updateContent(path, e.target.value);
        };

        // Different styles for dark vs light backgrounds
        const baseClasses = darkBg
            ? `bg-white/90 border-2 border-orange-400 outline-none px-2 py-1 rounded text-slate-800 w-full focus:bg-white focus:border-orange-500 ${className}`
            : `bg-orange-50 border-2 border-orange-300 outline-none px-2 py-1 rounded text-slate-800 w-full focus:bg-orange-100 focus:border-orange-400 ${className}`;

        if (as === 'textarea') {
            return (
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={fallback}
                    className={baseClasses}
                    onClick={(e) => e.stopPropagation()}
                />
            );
        }

        return (
            <input
                value={value || ''}
                onChange={handleChange}
                placeholder={fallback}
                className={baseClasses}
                onClick={(e) => e.stopPropagation()}
            />
        );
    };


    // Derived state for rendering
    const merchant = data;

    // Ensure content exists to prevent crash
    const content = merchant?.content || {};

    const isVIPMode = React.useMemo(() => {
        const type = content.offer?.type || content.offer_type;
        return type?.toLowerCase() === 'vip' || type?.toLowerCase() === 'gift';
    }, [content]);
    // Data Normalization from previous fix
    const normalizedOffer = content.offer || {
        value: content.offer_value || content.offerDiscount || 'Special',
        unit: 'OFF',
        description: content.offerDescription || 'Special Offer',
        type: content.offer_type || 'discount',
        totalLimit: 100
    };

    // Fix unit display if value already contains it
    // Fix unit display
    let displayValue = normalizedOffer.value || 'Special';
    // Ensure displayValue is a string
    if (typeof displayValue !== 'string') displayValue = String(displayValue);

    let defaultUnit = 'OFF';
    // If offer type implies a free item/gift, or value contains "Free", or "Pass" (case insensitive), default unit should be empty
    if (normalizedOffer.type === 'free_item' || normalizedOffer.type === 'gift' ||
        displayValue.toLowerCase().includes('free') ||
        displayValue.toLowerCase().includes('pass') ||
        displayValue.includes('$') || // Prices often don't need OFF unless it's "$10 OFF"
        displayValue.length > 10 ||   // Long texts are usually full descriptions
        displayValue.toLowerCase().includes('only') ||
        displayValue.toLowerCase().includes('from')) {
        defaultUnit = '';
    }

    let displayUnit = normalizedOffer.unit !== undefined ? normalizedOffer.unit : defaultUnit;

    // Double check: if value has text "OFF" or "Access" or "Free" or "Pass", clear unit
    if (displayValue.includes('OFF') || displayValue.includes('Access') ||
        displayValue.toLowerCase().includes('free') ||
        displayValue.toLowerCase().includes('pass') ||
        displayValue.toLowerCase().includes('% off')) {
        displayUnit = '';
    }

    const [formData, setFormData] = useState({
        phone: verifiedPhone || '',
        name: '',
        email: '',
        expectedVisitDate: '',
        expectedVisitTime: '',
    });

    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [shareUrl, setShareUrl] = useState('');
    const [referralCode, setReferralCode] = useState('');
    const couponRef = React.useRef<HTMLDivElement>(null);

    const handleClaim = async () => {
        // 1. Validation Logic
        if (!formData.name?.trim()) {
            alert('Please enter your name.');
            return;
        }
        if (!formData.phone || formData.phone.length < 10) {
            alert('Please enter a valid phone number.');
            return;
        }
        if (!formData.email?.trim() || !formData.email.includes('@')) {
            alert('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            // Call the actual API to claim coupon
            const response = await fetch('/api/public/coupons/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId: merchant.id,
                    phone: formData.phone,
                    name: formData.name || undefined,
                    email: formData.email || undefined,
                    // Merge Date and Time if both provided, otherwise use just date (which defaults to 00:00 UTC usually, or local)
                    // If time is provided, we construct a full local date string
                    expectedVisitDate: formData.expectedVisitTime
                        ? `${formData.expectedVisitDate}T${formData.expectedVisitTime}`
                        : formData.expectedVisitDate || undefined,
                    referralCode: searchParams.get('uid') || undefined,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to claim coupon');
            }

            // Success - show the coupon
            setLoading(false);
            setSuccessOpen(true);
            setCouponCode(result.coupon.code);
            setShareUrl(result.shareUrl || window.location.href);
            setReferralCode(result.referralCode || '');

            // 2. Direct Wallet Download Integration
            // Direct navigation is required for iOS Safari to handle .pkpass files correctly
            window.location.href = `/api/wallet/generate?code=${result.coupon.code}`;

            // Track Lead Event - 使用原生 window.fbq (更可靠)
            if (typeof window !== 'undefined' && (window as any).fbq) {
                try {
                    (window as any).fbq('track', 'Lead', {
                        content_name: merchant.name,
                        content_category: 'Coupon',
                        content_ids: [result.coupon.code],
                        value: 0,
                        currency: 'USD'
                    });
                    console.log('[Meta Pixel] Lead event tracked for:', merchant.name);
                } catch (fbError) {
                    console.error('[Meta Pixel] Failed to track Lead:', fbError);
                }
            } else {
                console.warn('[Meta Pixel] fbq not available, skipping Lead tracking');
            }

            // Track GA4 conversion
            if (typeof window !== 'undefined') {
                if ((window as any).gtag) {
                    (window as any).gtag('event', 'claim_coupon', {
                        merchant_id: merchant.id,
                        coupon_code: result.coupon.code
                    });
                }

                // PUSH TO GTM
                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                    'event': 'generate_lead',
                    'value': 10.00,
                    'currency': 'USD'
                });
                console.log('GTM Event Pushed: generate_lead');
            }

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF5722', '#F39C12', '#FFFFFF']
            });
        } catch (error: any) {
            console.error('Claim error:', error);
            alert(error.message || 'Failed to claim coupon. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        if (searchParams.get('new') === 'true' && canEdit) {
            setShowOnboarding(true);
            setTimeout(() => setShowOnboarding(false), 5000); // Auto hide after 5s
        }
    }, [searchParams, canEdit]);

    const handleSaveToPhotos = async () => {
        if (!couponRef.current) {
            alert('Coupon element not found. Please try again.');
            return;
        }

        try {
            // Dynamic import to avoid SSR issues
            const html2canvas = (await import('html2canvas')).default;

            const canvas = await html2canvas(couponRef.current, {
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                scale: 3, // Higher resolution
                logging: false,
                windowWidth: couponRef.current.scrollWidth,
                windowHeight: couponRef.current.scrollHeight,
            });

            // Convert to blob for better mobile support
            canvas.toBlob((blob) => {
                if (!blob) {
                    throw new Error('Failed to generate image');
                }

                // Try native share API first (better for mobile)
                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], `Coupon-${couponCode}.png`, { type: 'image/png' });
                    if (navigator.canShare({ files: [file] })) {
                        navigator.share({
                            files: [file],
                            title: 'My Coupon',
                            text: `${content.businessName || 'Coupon'} - ${couponCode}`
                        }).catch(() => {
                            // Fallback to download if share is cancelled
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.download = `Coupon-${couponCode}.png`;
                            link.href = url;
                            link.click();
                            URL.revokeObjectURL(url);
                        });
                        return;
                    }
                }

                // Fallback: Download link
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.download = `Coupon-${couponCode}.png`;
                link.href = url;
                link.click();
                URL.revokeObjectURL(url);

                // Show success message
                setTimeout(() => alert('✅ Coupon saved! Check your Downloads folder.'), 100);
            }, 'image/png');

        } catch (err) {
            console.error('Failed to save image:', err);

            // More helpful error message
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                alert('📸 Please take a screenshot to save your coupon!\n\niPhone: Side Button + Volume Up\nAndroid: Power + Volume Down');
            } else {
                alert('Could not save automatically. Please screenshot:\n\nMac: Cmd+Shift+4\nWindows: Win+Shift+S');
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F5F6F8] font-sans selection:bg-orange-500/30 pb-20">
            {/* Inject Poppins Font */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
                body { font-family: 'Poppins', sans-serif; }
                .font-poppins { font-family: 'Poppins', sans-serif; }
                
                .header-bg {
                    background: linear-gradient(
                        135deg,
                        #FFD700 0%,
                        #FFFACD 25%,
                        #FFD700 50%,
                        #B8860B 75%,
                        #FFD700 100%
                    );
                    /* polished inner glow */
                    box-shadow: inset 0 0 20px rgba(255, 255, 255, 0.5);
                    border-radius: 0 0 40px 40px;
                }
                
                /* ===== Make white text readable on gold ===== */
                .header-bg .title,
                .header-bg h1,
                .glass-card h2 {
                    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
                    -webkit-text-stroke: 0.6px rgba(100, 100, 100, 0.6);
                }

                .glass-card {
                    background: linear-gradient(135deg, #FFD700 0%, #FFFACD 50%, #FFD700 100%);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.4);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 0 10px rgba(255, 255, 255, 0.4);
                }

                .btn-orange {
                    background: linear-gradient(135deg, #FFD700 0%, #DB7093 100%);
                    box-shadow: 0 8px 24px rgba(219, 112, 147, 0.35);
                }
                .rating-badge {
                    background: linear-gradient(135deg, #F5A623 0%, #F39C12 100%);
                }
                .input-field {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.02);
                }
                .input-field:focus {
                    border-color: #FF5722;
                    box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.1);
                }
            `}</style>

            {/* Edit Mode Banner */}
            {ENABLE_VISUAL_EDITOR && isEditing && (
                <div className="bg-blue-600 text-white text-center py-2 px-4 shadow-md sticky top-0 z-50 animate-in slide-in-from-top">
                    <p className="text-sm font-bold flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        Editing Mode Active
                        <span className="text-blue-200 font-normal text-xs ml-2 hidden sm:inline">Tap any text to edit</span>
                    </p>
                </div>
            )}

            {/* Onboarding Toast */}
            {showOnboarding && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl animate-in fade-in zoom-in slide-in-from-bottom-4 duration-500 flex items-center gap-3">
                    <span className="text-2xl">👋</span>
                    <div>
                        <p className="font-bold text-sm">Welcome to your new page!</p>
                        <p className="text-xs text-slate-300">Tap the blue pen button to start editing.</p>
                    </div>
                    <button onClick={() => setShowOnboarding(false)} className="bg-white/10 rounded-full p-1 hover:bg-white/20 ml-2">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* ===== 顶部深绿色区域 ===== */}
            <div className="header-bg relative pb-[100px] overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-1/2 -right-[30%] w-[80%] h-full bg-[radial-gradient(ellipse,#FFD700_0%,transparent_60%)] opacity-[0.08] blur-[30px] pointer-events-none" />

                {/* Navbar */}
                <div className="flex justify-between items-center px-5 pt-12 pb-4 relative z-20">
                    <button className="w-11 h-11 rounded-full bg-white/10 border border-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-colors">
                        <ArrowLeft className="text-white w-5 h-5" />
                    </button>
                    <div className="flex gap-3">
                        {/* Buttons Removed */}
                    </div>
                </div>

                {/* Hero Content */}
                <div className="relative px-6 pt-2 pb-8 flex">
                    {/* Left Text */}
                    <div className="relative z-10 w-[85%] drop-shadow-md">
                        {/* Hero Title - only show if has value OR in editing mode */}
                        {(content.heroTitle || isEditing) && (
                            <p className="text-[#5C4033] text-sm font-bold mb-1 tracking-wide uppercase">
                                <EditableLabel
                                    path="heroTitle"
                                    value={content.heroTitle}
                                    fallback="例如: GRAND OPENING"
                                    darkBg={true}
                                />
                            </p>
                        )}
                        <h1 className="text-white text-[32px] sm:text-[38px] font-bold leading-[1.1] mb-2">
                            <EditableLabel
                                path="businessName"
                                value={content.businessName}
                                fallback="Business Name"
                                darkBg={true}
                            />
                        </h1>
                        {/* Hero Subtitle - only show if has value OR in editing mode */}
                        {(content.heroSubtitle || isEditing) && (
                            <p className="text-[#5C4033] text-sm mb-4 leading-relaxed font-bold">
                                <EditableLabel
                                    path="heroSubtitle"
                                    value={content.heroSubtitle}
                                    fallback="例如: Family Special"
                                    darkBg={true}
                                />
                            </p>
                        )}

                        <div className="flex items-center gap-3 mb-5">
                            <div className="rating-badge text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-current" />
                                {Number(content.rating || 4.8).toFixed(1)}
                            </div>
                            <span className="text-[#5C4033] text-sm font-bold">({content.reviewCount || '1.2k'} Reviews)</span>
                        </div>

                    </div>
                </div>
            </div>

            {/* ===== 玻璃卡片 (Glass Card) ===== */}
            <div className="mx-auto w-[92%] max-w-md -mt-16 relative z-20">
                <div className="glass-card rounded-[28px] p-5 relative overflow-hidden min-h-[190px]">
                    <div className="relative z-10">
                        {/* Only show eyebrow if it's not 'discount' to keep it clean */}
                        {normalizedOffer.type && normalizedOffer.type !== 'discount' && (
                            <p className="text-[#5C4033] text-[11px] tracking-[2px] font-bold mb-1 uppercase">
                                {normalizedOffer.type.replace('_', ' ')}
                            </p>
                        )}
                        <h2 className="text-white text-[36px] font-bold leading-tight mb-2">
                            <EditableLabel
                                path="offer.value"
                                value={normalizedOffer.value}
                                fallback="20%"
                                darkBg={true}
                                className="inline-block w-auto min-w-[60px]"
                            />
                            {' '}
                            {/* OFF Unit Removed */}
                        </h2>

                        {/* Offer Description with Multi-line Support */}
                        <div className="text-[#5C4033] text-sm mb-5 pr-16 whitespace-pre-line leading-relaxed font-bold">
                            <EditableLabel
                                path="offer.description"
                                value={content.offer?.description || normalizedOffer.description}
                                fallback="折扣描述..."
                                darkBg={true}
                                as="textarea"
                                className="min-h-[50px] bg-transparent border-b border-[#5C4033]/20 text-[#5C4033] placeholder:text-[#5C4033]/50 w-full"
                            />
                        </div>

                        {/* Social Proof (Updated) */}
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex -space-x-2">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-300 border border-white overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + claimedCount}`} alt="User" />
                                    </div>
                                ))}
                            </div>
                            <p className="text-[#5C4033] text-xs font-bold">
                                {(merchant.virtual_base_count || 120) + claimedCount}
                                <EditableLabel
                                    path="customLabels.social_proof_text"
                                    value={(content.customLabels as any)?.social_proof_text}
                                    fallback=" claimed this week"
                                    className="bg-transparent border-b border-[#5C4033]/20 text-[#5C4033] placeholder:text-[#5C4033]/50 w-auto inline-block ml-1"
                                />
                            </p>
                        </div>
                    </div>

                    {/* Round Icon (Premium Gold) */}
                    <div className="absolute right-4 top-4">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transform rotate-12"
                            style={{
                                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #B45309 100%)',
                                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 2px 4px rgba(255,255,255,0.3)',
                                border: '1px solid rgba(255,255,255,0.4)'
                            }}>
                            <Tag className="text-white w-6 h-6 fill-white drop-shadow-md" strokeWidth={1.5} />
                        </div>
                    </div>

                    {/* Dynamic Badge */}
                    <div className="absolute right-4 bottom-20">
                        <span className="bg-white/95 text-[#FF5722] text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm uppercase">
                            {content.offer_badge_text || 'HOT'}
                        </span>
                    </div>
                </div>
            </div>

            {/* ===== Claim Section (Inline Form or Success) ===== */}
            <div className="mx-auto w-[92%] max-w-md mt-5">
                {!successOpen ? (
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                <Tag className="text-[#DB7093] w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                                    <EditableLabel
                                        path="customLabels.section_title_claim"
                                        value={content.customLabels?.section_title_claim}
                                        fallback="Get Your Coupon"
                                    />
                                </h3>
                                <p className="text-slate-500 text-xs text-left">
                                    <EditableLabel
                                        path="customLabels.section_subtitle_claim"
                                        value={content.customLabels?.section_subtitle_claim}
                                        fallback="Fill details to claim instant discount"
                                    />
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {/* Name Input (Conditional) */}
                            {/* Name Input - Always required for real lead gen */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Name</label>
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl input-field text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Phone Input (Always Required) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                                <input
                                    type="tel"
                                    placeholder="(555) 000-0000"
                                    value={formData.phone}
                                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl input-field text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Email Input (Always show for Calendar Sync if possible) */}
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email <span className="text-orange-500">*</span></label>
                                <input
                                    type="email"
                                    placeholder="john@example.com"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full h-12 px-4 rounded-xl input-field text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                                />
                            </div>

                            {/* Expected Visit Date */}
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50">
                                <label className="block text-xs font-semibold text-[#E65100] uppercase tracking-wider mb-1.5 ml-1 flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    When do you plan to visit?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        min={(() => {
                                            const d = new Date();
                                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                            return d.toISOString().split('T')[0];
                                        })()}
                                        max={(() => {
                                            const d = new Date();
                                            d.setDate(d.getDate() + 7);
                                            d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                                            return d.toISOString().split('T')[0];
                                        })()}
                                        value={formData.expectedVisitDate}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expectedVisitDate: e.target.value }))}
                                        className="flex-1 h-12 px-4 rounded-xl border border-orange-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 font-medium min-w-[60%]"
                                    />
                                    <input
                                        type="time"
                                        value={formData.expectedVisitTime}
                                        onChange={(e) => setFormData(prev => ({ ...prev, expectedVisitTime: e.target.value }))}
                                        className="flex-1 h-12 px-2 text-center rounded-xl border border-orange-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                                    />
                                </div>
                                <p className="text-[10px] text-orange-600/70 mt-2 ml-1 italic">
                                    * Valid for 7 days only. We'll send a calendar invite!
                                </p>
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="mt-2 w-full btn-orange py-4 rounded-xl text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:grayscale"
                                style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.3)' }}
                            >
                                {loading ? 'Processing...' : (
                                    <EditableLabel
                                        path="customLabels.button_text_claim"
                                        value={content.customLabels?.button_text_claim}
                                        fallback="Add Coupon to Apple Wallet"
                                        className="bg-transparent text-white border-b-2 border-white/40 w-auto inline-block text-center placeholder:text-white/70"
                                    />
                                )}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 mt-2">
                                By clicking, you agree to receive texts. Std msg rates apply.
                            </p>

                            <div className="flex justify-center mt-6">
                                <Link
                                    href="/privacy-policy"
                                    className="text-[10px] text-slate-400/80 hover:text-slate-600 transition-colors underline decoration-slate-300 underline-offset-2"
                                >
                                    Privacy Policy
                                </Link>
                            </div>
                        </div>
                    </div>
                ) : normalizedOffer.type === 'vip' || normalizedOffer.type === 'vip_club' ? (
                    <div className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 animate-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                                <Star className="w-8 h-8 fill-current" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                <EditableLabel
                                    path="customLabels.vip_welcome_title"
                                    value={content.customLabels?.vip_welcome_title}
                                    fallback="Welcome to the Club!"
                                />
                            </h3>
                            <div className="text-slate-500 text-sm mb-6 leading-relaxed whitespace-pre-line">
                                <EditableLabel
                                    path="customLabels.vip_welcome_subtitle"
                                    value={content.customLabels?.vip_welcome_subtitle}
                                    fallback={'You are now on our VIP list.\nStay tuned for exclusive rewards & birthday treats sent to your phone!'}
                                    as="textarea"
                                    className="w-full text-center min-h-[60px]"
                                />
                            </div>

                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                                <p className="text-purple-800 text-sm font-medium">✨ You're all set!</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div ref={couponRef} className="bg-white rounded-[24px] p-6 shadow-md border border-slate-100 animate-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-orange-100/80 text-orange-500 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-6">
                                <EditableLabel
                                    path="customLabels.success_title"
                                    value={content.customLabels?.success_title}
                                    fallback="Claimed Successfully!"
                                />
                            </h3>

                            <div className="bg-slate-50/50 rounded-[2rem] p-8 border-2 border-dashed border-slate-200 relative mb-6 shadow-inner">
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-orange-500 text-white text-[10px] font-black px-4 py-1 rounded-full uppercase tracking-[0.2em] whitespace-nowrap">
                                    Redemption Code
                                </div>
                                <div className="py-2">
                                    <p className="text-4xl font-mono font-black text-slate-800 tracking-widest leading-none">{couponCode}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200/60">
                                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                                        Show this code to staff<br />
                                        to redeem your offer
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button onClick={handleSaveToPhotos} className="w-full bg-slate-100 text-slate-600 font-bold py-3.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.98]">
                                    <Save className="w-4 h-4" />
                                    Save to Photos
                                </button>

                                <div className="w-full">
                                    <AppleWalletButton couponCode={couponCode} className="w-full" />
                                </div>
                            </div>

                            <p className="text-[10px] text-zinc-400 mt-8 uppercase tracking-[0.2em] font-black">
                                Valid for 30 days • Save this page
                            </p>

                            {/* Referral Incentive Card */}
                            <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-5">
                                <div className="flex items-start gap-3 mb-3">
                                    <span className="text-3xl">🎁</span>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 text-base mb-1">
                                            Share with friends, both get extra rewards!
                                        </h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Your friends get amazing deals, and you earn rewards for each referral
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white/80 rounded-lg p-3 mb-3">
                                    <p className="text-xs text-slate-500 font-medium mb-1.5">Your Exclusive Link:</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs text-blue-600 font-mono flex-1 truncate">{shareUrl}</p>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(shareUrl);
                                                alert('✓ Link copied to clipboard!');
                                            }}
                                            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-md transition-colors"
                                        >
                                            Copy
                                        </button>
                                    </div>
                                </div>

                                {referralCode && (
                                    <div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg p-3 border border-orange-200">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs text-slate-600 font-medium">Your Referral Code:</p>
                                                <p className="text-sm font-bold text-orange-700 font-mono">{referralCode}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500">Referrals</p>
                                                <p className="text-xl font-bold text-orange-600">0</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Social Share Section */}
                            <div className="mt-8 border-t border-dashed border-slate-200 pt-6">
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">
                                    Share & Get Rewards
                                </p>
                                <p className="text-[11px] text-slate-500 mb-4">
                                    Share your unique link and earn rewards when friends claim!
                                </p>
                                <div className="grid grid-cols-4 gap-2">
                                    {/* Facebook */}
                                    <button
                                        onClick={() => {
                                            const url = encodeURIComponent(shareUrl);
                                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                                        }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                            <Share className="w-5 h-5 fill-current" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Facebook</span>
                                    </button>

                                    {/* SMS / Text */}
                                    <button
                                        onClick={() => {
                                            const text = `Get ${displayValue} ${displayUnit} at ${merchant.name}! ${shareUrl}`;
                                            window.location.href = `sms:?body=${encodeURIComponent(text)}`;
                                        }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-[#4CAF50] text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                            <Phone className="w-5 h-5 fill-current" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Message</span>
                                    </button>

                                    {/* Email */}
                                    <button
                                        onClick={() => {
                                            const subject = `Check out this deal at ${merchant.name}`;
                                            const body = `I got ${displayValue} ${displayUnit} at ${merchant.name}! Get yours here: ${shareUrl}`;
                                            window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                                        }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-600 text-white flex items-center justify-center shadow-sm hover:scale-105 transition-transform">
                                            <div className="w-5 h-5 flex items-center justify-center font-bold text-xs">@</div>
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Email</span>
                                    </button>

                                    {/* Copy Link */}
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(shareUrl);
                                            alert('Referral link copied!');
                                        }}
                                        className="flex flex-col items-center gap-1"
                                    >
                                        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shadow-sm hover:bg-slate-200 hover:scale-105 transition-transform">
                                            <Tag className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] text-slate-500 font-medium">Copy</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Info Card ===== */}
            <div className="mx-auto w-[92%] max-w-md mt-5">
                <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
                    {/* Address Card */}
                    <div className="flex items-start gap-4 p-4">
                        <div className="w-5 pt-1">
                            <MapPin className="text-[#FF5722] w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-800 font-semibold text-[15px] mb-0.5">
                                <EditableLabel
                                    path="customLabels.section_title_visit"
                                    value={content.customLabels?.section_title_visit}
                                    fallback="Visit Us"
                                />
                            </p>
                            <p className="text-slate-500 text-[13px] leading-relaxed">
                                <EditableLabel
                                    path="address.fullAddress"
                                    value={content.address?.fullAddress || ((content.address?.street || content.address?.area) ? `${content.address?.street || ''} ${content.address?.area || ''}` : '')}
                                    fallback="地址..."
                                />
                            </p>
                        </div>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                content.address?.fullAddress || `${content.address?.street || ''} ${content.address?.area || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-[#5D4037] text-white flex items-center justify-center hover:bg-[#4E342E] transition-colors"
                        >
                            <ArrowRight className="w-5 h-5 -rotate-45" />
                        </a>
                    </div>

                    <div className="border-t border-slate-100 mx-4"></div>

                    {/* Opening Hours */}
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-5">
                            <Clock className="text-[#FF5722] w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-800 font-semibold text-[15px] mb-0.5">
                                <EditableLabel
                                    path="customLabels.section_title_hours"
                                    value={content.customLabels?.section_title_hours}
                                    fallback="Opening Hours"
                                />
                            </p>
                            <p className="text-slate-500 text-[13px]">
                                <EditableLabel
                                    path="openingHours.specialHours"
                                    value={content.openingHours?.specialHours || content.openingHours?.currentStatus}
                                    fallback="Mon-Sun 10:00 AM - 9:00 PM"
                                />
                            </p>
                        </div>
                    </div>

                    {/* Website (Optional) */}
                    {
                        content.website && (
                            <>
                                <div className="border-t border-slate-100 mx-4"></div>
                                <div className="flex items-center gap-4 p-4">
                                    <div className="w-5">
                                        <Globe className="text-[#1976D2] w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-800 font-semibold text-[15px] mb-0.5">
                                            <EditableLabel
                                                path="customLabels.section_title_website"
                                                value={content.customLabels?.section_title_website}
                                                fallback="Website"
                                            />
                                        </p>
                                        <p className="text-slate-500 text-[13px] truncate max-w-[200px]">{content.website}</p>
                                    </div>
                                    <a
                                        href={content.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-[#1976D2] hover:bg-blue-50"
                                    >
                                        <ArrowRight className="w-5 h-5 -rotate-45" />
                                    </a>
                                </div>
                            </>
                        )
                    }

                    <div className="border-t border-slate-100 mx-4"></div>

                    {/* Phone */}
                    <div className="flex items-center gap-4 p-4">
                        <div className="w-5">
                            <Phone className="text-[#6D4C41] w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-800 font-semibold text-[15px] mb-0.5">
                                <EditableLabel
                                    path="customLabels.section_title_call"
                                    value={content.customLabels?.section_title_call}
                                    fallback="Call Us"
                                />
                            </p>
                            <p className="text-slate-500 text-[13px]">
                                <EditableLabel
                                    path="phone"
                                    value={content.phone}
                                    fallback="(555) 123-4567"
                                />
                            </p>
                        </div>
                        <a
                            href={`tel:${content.phone}`}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#FF5722] hover:bg-orange-50"
                        >
                            <Phone className="w-6 h-6" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center py-8">
                <p className="text-slate-400 text-xs">
                    Powered by <span className="text-slate-500 font-semibold">Hiraccoon</span>
                </p>
            </div>

            {/* === EDIT MODE CONTROLS === */}
            {ENABLE_VISUAL_EDITOR && canEdit && (
                <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={() => setIsEditing(false)}
                                className="w-14 h-14 bg-slate-100 text-slate-600 rounded-full shadow-lg flex items-center justify-center hover:bg-slate-200 transition-all"
                                title="Cancel Editing"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-14 h-14 bg-orange-500 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-orange-600 transition-all animate-bounce-subtle"
                                title="Save Changes"
                            >
                                {isSaving ? <span className="loading loading-spinner w-5">...</span> : <Save className="w-6 h-6" />}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
                            title="Edit Page Text"
                        >
                            <Edit2 className="w-6 h-6" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
