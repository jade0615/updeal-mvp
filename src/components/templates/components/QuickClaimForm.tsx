'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';

interface QuickClaimFormProps {
    merchantId: string;
    phone: string;
    onClaimSuccess?: (data: any) => void;
}

export default function QuickClaimForm({ merchantId, phone, onClaimSuccess }: QuickClaimFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleQuickClaim = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/public/coupons/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantId,
                    phone: phone, // Use the prop phone
                    name: 'Valued Customer', // Default name since we don't ask
                }),
            });

            const result = await response.json();

            if (!result.success) {
                // If already claimed, we might want to handle it gracefully
                if (result.error?.includes('already claimed')) {
                    // Still treat as success for the UI flow, just show the code
                    // But usually the API returns the code even if claimed? 
                    // Let's assume standard error flow first.
                    // Actually, for "already claimed", we likely want to just show the coupon.
                    // But let's stick to basic error handling for now unless we know the API behavior.
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
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-8 mb-8 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-white/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-500 opacity-20" />

            <div className="text-center mb-6 space-y-3">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-2xl font-black text-slate-900">
                    Verified Member
                </h3>
                <p className="text-slate-500 text-sm font-medium px-4">
                    Your number <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{phone}</span> is eligible for this exclusive offer.
                </p>
            </div>

            <div className="space-y-4">
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
                    <a href="#" className="underline hover:text-slate-600 transition-colors">Privacy Policy</a>
                    {' • '}
                    <a href="#" className="underline hover:text-slate-600 transition-colors">Terms of Service</a>
                </p>
            </div>
        </div>
    );
}
