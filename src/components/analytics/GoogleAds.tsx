'use client';

import Script from 'next/script';

export default function GoogleAds() {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    if (!adsId) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
                strategy="afterInteractive"
            />
            <Script
                id="google-ads-gtag"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${adsId}');
                    `,
                }}
            />
        </>
    );
}
