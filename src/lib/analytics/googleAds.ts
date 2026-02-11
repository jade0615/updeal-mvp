'use client';

export interface GoogleAdsConversionParams {
    value?: number;
    currency?: string;
    transactionId?: string;
}

export function trackGoogleAdsConversion(params: GoogleAdsConversionParams = {}) {
    if (typeof window === 'undefined') return;
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL;
    if (!adsId || !conversionLabel) return;

    const gtag = (window as any).gtag;
    if (typeof gtag !== 'function') return;

    const payload: Record<string, any> = {
        send_to: `${adsId}/${conversionLabel}`,
    };

    if (typeof params.value === 'number') payload.value = params.value;
    if (params.currency) payload.currency = params.currency;
    if (params.transactionId) payload.transaction_id = params.transactionId;

    gtag('event', 'conversion', payload);
}
