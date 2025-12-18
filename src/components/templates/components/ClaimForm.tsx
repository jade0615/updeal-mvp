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
    name: z.string().optional(),
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
                // Meta Pixel Lead Event
                import('react-facebook-pixel')
                    .then((x) => x.default)
                    .then((ReactPixel) => {
                        ReactPixel.track('Lead', {
                            content_name: 'Coupon Claim',
                            content_category: 'Lead',
                            content_ids: [result.coupon.code],
                            currency: 'USD',
                            value: 10.00 // Arbitrary value for lead
                        });
                    });
            }

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="rounded-xl border border-green-100 bg-green-50 p-6 text-center">
                <h3 className="mb-2 text-xl font-bold text-green-800">Coupon Claimed!</h3>
                <p className="mb-4 text-sm text-green-700">Check your phone for the coupon code.</p>
                <div className="mx-auto mb-2 w-max rounded-lg bg-white px-4 py-2 font-mono text-xl font-bold tracking-widest text-green-600 shadow-sm border border-green-100">
                    {successData.coupon.code}
                </div>
                <p className="text-xs text-green-600">Expires: {new Date(successData.coupon.expiresAt).toLocaleDateString()}</p>
            </div>
        );
    }

    return (
        <div className="mb-8 rounded-xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            <h3 className="mb-4 text-center text-lg font-bold text-gray-900">
                Get Your Coupon Now
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="phone" className="sr-only">Phone Number</label>
                    <input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
                        {...register('phone')}
                    />
                    {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>

                <div>
                    <label htmlFor="name" className="sr-only">Name (Optional)</label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Name (Optional)"
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-sm"
                        {...register('name')}
                    />
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-70"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            Claim Offer
                            <ArrowRight className="h-5 w-5" />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-gray-400">
                    We'll text you the coupon code. No spam, ever.
                </p>
            </form>
        </div>
    );
}
