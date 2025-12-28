'use client';

import Script from 'next/script';

export default function GoogleTagManager() {
    return (
        <>
            {/* Google Tag Manager */}
            <Script
                id="gtm-script"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MLF6LPW2');`,
                }}
            />
            {/* End Google Tag Manager */}

            {/* Google Tag Manager (noscript) */}
            <noscript>
                <iframe
                    src="https://www.googletagmanager.com/ns.html?id=GTM-MLF6LPW2"
                    height="0"
                    width="0"
                    style={{ display: 'none', visibility: 'hidden' }}
                />
            </noscript>
            {/* End Google Tag Manager (noscript) */}
        </>
    );
}

// Helper function to push events to dataLayer
export function pushToDataLayer(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || []
    ;(window as any).dataLayer.push({
      event,
      ...data,
    })
  }
}
