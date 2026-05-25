/**
 * sitemap.xml — generated at build time via Next.js App Router's `sitemap.ts`
 * convention.
 *
 * Includes:
 *   - The B2B partner-showcase landing at `/`
 *   - The C-end aggregator landing at `/restaurants/`
 *   - One entry per individual restaurant detail page
 *   - The 5 platform-level legal pages
 *
 * Deliberately excludes:
 *   - `/[slug]/` claim-coupon pages (those are reached via SMS/Apple Wallet
 *     links, not organic search)
 *   - `/admin/*`, `/merchant/*`, `/api/*`, `/verify/*`, `/store-redeem/*`
 *   - `/demo/*`
 *
 * TODO: when /cuisines/ and /cities/ pages launch (after 8-10 restaurants
 *       are onboarded), add them here.
 */
import type { MetadataRoute } from 'next';
import { RESTAURANTS, urlSlugFor } from '@/data/restaurants';

const BASE = 'https://hiraccoon.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const restaurantEntries: MetadataRoute.Sitemap = RESTAURANTS.map((r) => ({
    url: `${BASE}/restaurants/${urlSlugFor(r)}/`,
    lastModified: new Date('2026-05-26'),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: `${BASE}/`,
      lastModified: new Date('2026-05-26'),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE}/restaurants/`,
      lastModified: new Date('2026-05-26'),
      changeFrequency: 'weekly', // grid updates whenever a new merchant onboards
      priority: 0.9,
    },
    ...restaurantEntries,

    // Legal — low priority, content rarely changes
    {
      url: `${BASE}/terms-of-service`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/privacy-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/refund-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/cancellation-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE}/dispute-policy`,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
