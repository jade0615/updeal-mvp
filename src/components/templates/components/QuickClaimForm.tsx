'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { trackGoogleAdsConversion } from '@/lib/analytics/googleAds';

interface QuickClaimFormProps {
    merchantId: string;
    phone: string;
    onClaimSuccess?: (data: any) => void;
}

export default function QuickClaimForm({ merchantId, phone, onClaimSuccess }: QuickClaimFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [expectedVisitDate, setExpectedVisitDate] = useState('');

    const handleQuickClaim = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/public/coupons/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    phone: phone,
                    email: email || undefined,
                    expectedVisitDate: expectedVisitDate || undefined,
                    name: 'Valued Customer',
                }),
            });

            const result = await response.json();

            if (!result.success) {
                // If already claimed, we might want to handle it gracefully
                if (result.error?.includes('already claimed')) {
                    throw new Error(result.error);
                }
                throw new Error(result.error || 'Failed to claim coupon');
            }

            if (onClaimSuccess) onClaimSuccess(result);

            // Track standard events
            if (typeof window !== 'undefined') {
                if ((window as any).gtag) {
                    (window as any).gtag('event', 'claim_coupon', {
                        merchant_id: merchantId,
                        coupon_code: result.coupon.code
                    });
                }

                // PUSH TO GTM (Add this immediately after success validation)
                (window as any).dataLayer = (window as any).dataLayer || [];
                (window as any).dataLayer.push({
                    'event': 'generate_lead',  // This exact name is CRITICAL
                    'value': 10.00,            // Optional value
                    'currency': 'USD'
                });
                console.log('GTM Event Pushed: generate_lead'); // Add log for debugging

                trackGoogleAdsConversion({
                    value: 10.00,
                    currency: 'USD',
                    transactionId: result.coupon.code
                });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-4 mb-4 bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-20" />

            <div className="text-center mb-2 space-y-2">
                <div className="bg-orange-100/80 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck className="w-6 h-6 text-orange-500" />
                </div>

                <h3 className="text-xl font-black text-slate-900">
                    Verified Member
                </h3>
                <p className="text-slate-500 text-xs font-medium px-4">
                    Your number <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{phone}</span> is eligible for this exclusive offer.
                </p>
            </div>

            <div className="space-y-4">
                <div className="space-y-3">
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">Email (Optional)</label>
                        <input
                            type="email"
                            placeholder="To receive calendar invite"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>
                    <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 uppercase ml-2 mb-1 block">When do you plan to visit?</label>
                        <input
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            value={expectedVisitDate}
                            onChange={(e) => setExpectedVisitDate(e.target.value)}
                            className="w-full h-12 bg-slate-50 border border-slate-200 rounded-2xl px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                    </div>
                </div>

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-600 border border-red-100 text-center">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleQuickClaim}
                    disabled={isSubmitting}
                    className="btn-jelly w-full py-4 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin" />
                            Getting Code...
                        </>
                    ) : (
                        <>
                            <span>Agree & Get Coupon</span>
                            <CheckCircle2 className="w-6 h-6" />
                        </>
                    )}
                </button>

                <p className="text-center text-slate-400 text-[10px] font-medium leading-relaxed px-4">
                    By clicking above, you agree to receive your coupon code via SMS.
                    Standard rates may apply.
                    <br />
                    <a href="/privacy-policy" target="_blank" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
                    {' • '}
                    <a href="/terms-of-service" target="_blank" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
                </p>
            </div>
        </div>
    );
}
