'use client';

import React, { useState, useEffect } from 'react';
import {
    ArrowLeft, Heart, Share, Star, ShieldCheck, Clock, MapPin,
    Tag, ArrowRight, Phone, Check, X, Globe, Calendar, Edit2, Save, XCircle
} from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import type { Merchant } from '@/types/merchant';
import { updateMerchant } from '@/actions/merchants';
import confetti from 'canvas-confetti';

interface Props {
    merchant: Merchant;
    claimedCount: number;
    canEdit?: boolean;
}

export default function MobilePremiumTemplate({ merchant: initialMerchant, claimedCount, canEdit = false }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const verifiedPhone = searchParams.get('phone') || searchParams.get('p');

    // Visual Editor State
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState(initialMerchant);
    const [isSaving, setIsSaving] = useState(false);

    // Sync if initialMerchant changes (revalidation)
    useEffect(() => {
        setData(initialMerchant);
    }, [initialMerchant]);

    // Helper: Update Content
    const updateContent = (path: string, value: any) => {
        setData(prev => {
            const newContent = { ...prev.content };

            // Handle customLabels direct path
            if (path.startsWith('customLabels.')) {
                const key = path.split('.')[1];
                newContent.customLabels = {
                    ...newContent.customLabels,
                    [key]: value
                };
            } else {
                // Generic handler (basic)
                // For this template we mostly use customLabels
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

    // Helper Component: Editable Label
    const EditableLabel = ({
        path,
        value,
        params = {},
        fallback = '',
        className = '',
        as = 'input'
    }: {
        path: string,
        value?: string | null,
        params?: Record<string, string>, // unused currently, generic hook 
        fallback?: string,
        className?: string,
        as?: 'input' | 'textarea'
    }) => {
        const displayValue = value || fallback;

        if (!isEditing) {
            return <>{displayValue}</>;
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            updateContent(path, e.target.value);
        };

        const commonClasses = `bg-yellow-50 border-b-2 border-yellow-300 outline-none px-1 text-slate-800 w-full active:bg-yellow-100 ${className}`;

        if (as === 'textarea') {
            return (
                <textarea
                    value={value || ''}
                    onChange={handleChange}
                    placeholder={fallback}
                    className={commonClasses}
                    onClick={(e) => e.stopPropagation()} // Prevent click propagation if in container
                />
            );
        }

        return (
            <input
                value={value || ''}
                onChange={handleChange}
                placeholder={fallback}
                className={commonClasses}
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
        displayValue.toLowerCase().includes('pass')) {
        defaultUnit = '';
    }

    let displayUnit = normalizedOffer.unit !== undefined ? normalizedOffer.unit : defaultUnit;

    // Double check: if value has text "OFF" or "Access" or "Free" or "Pass", clear unit
    if (displayValue.includes('OFF') || displayValue.includes('Access') ||
        displayValue.toLowerCase().includes('free') ||
        displayValue.toLowerCase().includes('pass')) {
        displayUnit = '';
    }

    const [formData, setFormData] = useState({
        phone: verifiedPhone || '',
        name: '',
        email: ''
    });

    const [loading, setLoading] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const couponRef = React.useRef<HTMLDivElement>(null);

    const handleClaim = async () => {
        if (!formData.phone || formData.phone.length < 10) return;

        setLoading(true);
        // Simulator API call / Success
        setTimeout(() => {
            setLoading(false);
            setSuccessOpen(true);
            setCouponCode('DEAL-' + Math.random().toString(36).substr(2, 6).toUpperCase());

            // Track Lead Event (Client Side)
            import('react-facebook-pixel')
                .then((x) => x.default)
                .then((ReactPixel) => {
                    ReactPixel.track('Lead', {
                        content_name: merchant.name,
                        content_category: 'Coupon'
                    });
                });

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF5722', '#F39C12', '#FFFFFF']
            });
        }, 800);
    };

    const handleSaveToPhotos = async () => {
        if (!couponRef.current) return;
        try {
            // Dynamic import to avoid SSR issues
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(couponRef.current, {
                useCORS: true,
                backgroundColor: null, // Transparent background if possible, or force white
                scale: 2 // High resolution
            });
            const link = document.createElement('a');
            link.download = `UpDeal-${content.businessName || 'Coupon'}-Coupon.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Failed to save image:', err);
            alert('Sorry, could not save image automatically. Please take a screenshot!');
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
                    background: linear-gradient(160deg, #1A4D40 0%, #0D3B30 50%, #0A2E25 100%);
                    border-radius: 0 0 40px 40px;
                }
                .glass-card {
                    background: linear-gradient(145deg, rgba(26, 77, 64, 0.85) 0%, rgba(10, 46, 37, 0.95) 100%);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2);
                }
                .btn-orange {
                    background: linear-gradient(135deg, #FF6B4A 0%, #FF5233 100%);
                    box-shadow: 0 8px 24px rgba(255, 82, 51, 0.35);
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

            {/* ===== 顶部深绿色区域 ===== */}
            <div className="header-bg relative pb-[100px] overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute -top-1/2 -right-[30%] w-[80%] h-full bg-[radial-gradient(ellipse,rgba(45,90,75,0.4)_0%,transparent_60%)] pointer-events-none" />

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
                    <div className="relative z-10 w-[85%]">
                        {content.heroTitle && (
                            <p className="text-white/80 text-sm font-medium mb-1 tracking-wide uppercase">
                                {content.heroTitle}
                            </p>
                        )}
                        <h1 className="text-white text-[32px] sm:text-[38px] font-bold leading-[1.1] mb-2">
                            {content.businessName}
                        </h1>
                        {content.heroSubtitle && (
                            <p className="text-white/90 text-sm mb-4 leading-relaxed font-light">
                                {content.heroSubtitle}
                            </p>
                        )}

                        <div className="flex items-center gap-3 mb-5">
                            <div className="rating-badge text-white font-bold px-3 py-1.5 rounded-lg inline-flex items-center gap-1 text-sm">
                                <Star className="w-4 h-4 fill-current" />
                                {Number(content.rating || 4.8).toFixed(1)}
                            </div>
                            <span className="text-white/70 text-sm">({content.reviewCount || '1.2k'} Reviews)</span>
                        </div>

                    </div>
                </div>
            </div>

            {/* ===== 玻璃卡片 (Glass Card) ===== */}
            <div className="px-5 -mt-16 relative z-20">
                <div className="glass-card rounded-[28px] p-5 relative overflow-hidden min-h-[190px]">
                    <div className="relative z-10">
                        {/* Only show eyebrow if it's not 'discount' to keep it clean */}
                        {normalizedOffer.type && normalizedOffer.type !== 'discount' && (
                            <p className="text-white/70 text-[11px] tracking-[2px] font-semibold mb-1 uppercase">
                                {normalizedOffer.type.replace('_', ' ')}
                            </p>
                        )}
                        <h2 className="text-white text-[36px] font-bold leading-tight mb-2">
                            {displayValue} <span className="text-orange-300 text-2xl">{displayUnit}</span>
                        </h2>

                        {/* Offer Description with Multi-line Support */}
                        <div className="text-white/80 text-sm mb-5 pr-4 whitespace-pre-line leading-relaxed">
                            {normalizedOffer.description}
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
                            <p className="text-white/80 text-xs font-medium">
                                {claimedCount + 42} claimed this week
                            </p>
                        </div>
                    </div>

                    {/* Round Icon */}
                    <div className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                        <Tag className="text-white w-5 h-5" />
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
            <div className="px-5 mt-5">
                {!successOpen ? (
                    <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center">
                                <Tag className="text-[#FF5722] w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">
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
                            {Boolean(content.requirements?.collectName ?? true) && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Name</label>
                                    <input
                                        type="text"
                                        placeholder="Your Name"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl input-field text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                                    />
                                </div>
                            )}

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

                            {/* Email Input (Conditional) */}
                            {Boolean(content.requirements?.collectEmail ?? false) && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 ml-1">Email <span className="text-slate-300 font-normal normal-case">(Optional)</span></label>
                                    <input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full h-12 px-4 rounded-xl input-field text-slate-800 placeholder:text-slate-400 outline-none transition-all font-medium"
                                    />
                                </div>
                            )}

                            <button
                                onClick={handleClaim}
                                disabled={loading || !formData.phone || formData.phone.length < 10}
                                className="mt-2 w-full btn-orange py-4 rounded-xl text-white font-bold text-[16px] flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:grayscale"
                            >
                                {loading ? 'Processing...' : (
                                    <EditableLabel
                                        path="customLabels.button_text_claim"
                                        value={content.customLabels?.button_text_claim}
                                        fallback="Claim Coupon Now"
                                        className="bg-transparent text-white border-b-2 border-white/40 w-auto inline-block text-center placeholder:text-white/70"
                                    />
                                )}
                                {!loading && <ArrowRight className="w-5 h-5" />}
                            </button>

                            <p className="text-center text-[10px] text-slate-400 mt-2">
                                By clicking, you agree to receive texts. Std msg rates apply.
                            </p>
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
                            <div className="w-16 h-16 mx-auto rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-1">
                                <EditableLabel
                                    path="customLabels.success_title"
                                    value={content.customLabels?.success_title}
                                    fallback="Coupon Claimed!"
                                />
                            </h3>
                            <p className="text-slate-500 text-sm mb-6">
                                <EditableLabel
                                    path="customLabels.success_subtitle"
                                    value={content.customLabels?.success_subtitle}
                                    fallback="Show this code to the staff."
                                />
                            </p>

                            <div className="bg-slate-50 rounded-xl p-4 border border-dashed border-slate-300 relative group cursor-pointer active:bg-slate-100 transition-colors" onClick={() => {
                                navigator.clipboard.writeText(couponCode);
                            }}>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">
                                    <EditableLabel
                                        path="customLabels.success_code_label"
                                        value={content.customLabels?.success_code_label}
                                        fallback="Redemption Code"
                                    />
                                </p>
                                <p className="text-2xl font-mono font-bold text-slate-800 tracking-widest">{couponCode}</p>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-[10px] bg-slate-800 text-white px-2 py-1 rounded">Copy</span>
                                </div>
                            </div>

                            <button onClick={handleSaveToPhotos} className="mt-6 w-full bg-slate-100 text-slate-600 font-semibold py-3.5 rounded-xl hover:bg-slate-200 transition-colors">
                                Save to Photos
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ===== Info Card ===== */}
            <div className="px-5 mt-5">
                <div className="bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.06)] overflow-hidden">
                    {/* Address */}
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
                                {content.address?.fullAddress || ((content.address?.street || content.address?.area) ? `${content.address?.street || ''} ${content.address?.area || ''}` : 'Address not available')}
                            </p>
                        </div>
                        <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                content.address?.fullAddress || `${content.address?.street || ''} ${content.address?.area || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-[#5D4037] text-white flex items-center justify-center"
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
                                {content.openingHours?.specialHours || content.openingHours?.currentStatus || "Mon-Sun 10:00 AM - 9:00 PM"}
                            </p>
                        </div>
                    </div>

                    {/* Website (Optional) */}
                    {content.website && (
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
                    )}

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
                            <p className="text-slate-500 text-[13px]">{content.phone}</p>
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
                    Powered by <span className="text-slate-500 font-semibold">UpDeal</span>
                </p>
            </div>

            {/* === EDIT MODE CONTROLS === */}
            {canEdit && (
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
                                className="w-14 h-14 bg-green-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-green-700 transition-all animate-bounce-subtle"
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
