'use client';

import { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { parsePhoneNumber } from 'libphonenumber-js';

const formSchema = z.object({
    phone: z.string().min(10, 'Valid phone number is required').transform((val) => {
        try {
            const parsed = parsePhoneNumber(val, 'US');
            return parsed ? parsed.format('E.164') : val;
        } catch (e) {
            return val;
        }
    }),
    name: z.string().min(1, 'Name is required'),
});

type FormValues = z.infer<typeof formSchema>;

interface ClaimFormProps {
    merchantId: string;
    onClaimSuccess?: (data: any) => void;
}

export default function ClaimForm({ merchantId, onClaimSuccess }: ClaimFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successData, setSuccessData] = useState<any | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
    });

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/public/coupons/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    phone: data.phone,
                    name: data.name,
                }),
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || 'Failed to claim coupon');
            }

            setSuccessData(result);
            if (onClaimSuccess) onClaimSuccess(result);

            // Track GA4 conversion
            if (typeof window !== 'undefined') {
                if ((window as any).gtag) {
                    (window as any).gtag('event', 'claim_coupon', {
                        merchant_id: merchantId,
                        coupon_code: result.coupon.code
                    });
                }
                // Meta Pixel Lead Event - 使用原生 window.fbq (更可靠)
                if ((window as any).fbq) {
                    try {
                        (window as any).fbq('track', 'Lead', {
                            content_name: 'Coupon Claim',
                            content_category: 'Lead',
                            content_ids: [result.coupon.code],
                            currency: 'USD',
                            value: 10.00 // Arbitrary value for lead
                        });
                    } catch (fbError) {
                        console.error('[Meta Pixel] Failed to track Lead in ClaimForm:', fbError);
                    }
                }

                // PUSH TO GTM (Add this immediately after success validation)
                if (typeof window !== 'undefined') {
                    (window as any).dataLayer = (window as any).dataLayer || [];
                    (window as any).dataLayer.push({
                        'event': 'generate_lead',  // This exact name is CRITICAL
                        'value': 10.00,            // Optional value
                        'currency': 'USD'
                    });
                    console.log('GTM Event Pushed: generate_lead'); // Add log for debugging
                }
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="rounded-xl border border-orange-200/70 bg-orange-50/80 p-6 text-center animate-in zoom-in duration-500 backdrop-blur-sm">
                <h3 className="mb-2 text-xl font-bold text-orange-800">Coupon Claimed!</h3>
                <p className="mb-4 text-sm font-bold text-orange-700 leading-relaxed">
                    到店时将此兑换码告知店员即可使用<br />
                    Show this code to staff to redeem
                </p>
                <div className="mx-auto mb-2 w-max rounded-lg bg-white px-4 py-2 font-mono text-xl font-bold tracking-widest text-orange-600 shadow-sm border border-orange-200/70">
                    {successData.coupon.code}
                </div>
                <p className="text-xs text-orange-600">Expires: {new Date(successData.coupon.expiresAt).toLocaleDateString()}</p>
            </div>
        );
    }

    return (
        <div className="mt-8 mb-8 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-20" />

            <div className="text-center mb-6">
                <h3 className="text-2xl font-black lux-gold-text mb-1">
                    Claim Your Deal 🎁
                </h3>
                <p className="text-[#5C4033] text-sm font-bold">Fill in your info to get this special offer</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <div className="relative group">
                    <label className="block text-[#5C4033] text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1">Full Name</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="John Doe"
                            aria-label="Full name"
                            className="jelly-input w-full px-5 py-4 rounded-2xl text-slate-700 placeholder-slate-400 text-[15px] font-medium outline-none transition-all focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30"
                            {...register('name')}
                        />
                    </div>
                </div>

                {/* Phone */}
                <div className="relative group">
                    <label className="block text-[#5C4033] text-[11px] font-bold uppercase tracking-wider mb-1.5 ml-1">Phone Number</label>
                    <div className="relative">
                        <input
                            type="tel"
                            placeholder="(555) 000-0000"
                            aria-label="Phone number"
                            className={`jelly-input w-full px-5 py-4 rounded-2xl text-slate-700 placeholder-slate-400 text-[15px] font-medium outline-none transition-all focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/30 ${errors.phone ? 'border-red-400' : ''}`}
                            {...register('phone')}
                        />
                        {errors.phone && <p className="mt-1.5 text-xs font-bold text-red-500 ml-1">{errors.phone.message}</p>}
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 italic">
                        ⚠️ {error}
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-jelly w-full py-4.5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 mt-4 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <span className="lux-gold-text">Claim Now</span>
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                                <ArrowRight className="h-4.5 w-4.5" />
                            </div>
                        </>
                    )}
                </button>

                <p className="text-center text-[#5C4033] text-[11px] font-bold mt-4">
                    🔒 Your info is safe. We never spam.
                </p>
            </form>
        </div>
    );
}
