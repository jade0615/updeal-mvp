/**
 * robots.txt — generated at build time via Next.js App Router's `robots.ts`
 * convention.
 *
 * Allow public marketing + directory pages. Disallow admin / merchant
 * dashboards, internal APIs, claim-coupon pages (those are personal /
 * one-time-use links from SMS or Apple Wallet, no SEO value), redeem flow,
 * and the verify endpoint.
 */
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/merchant',
          '/api',
          '/verify',
          '/store-redeem',
          '/demo',
        ],
      },
    ],
    sitemap: 'https://hiraccoon.com/sitemap.xml',
    host: 'https://hiraccoon.com',
  };
}
