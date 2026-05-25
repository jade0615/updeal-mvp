/**
 * C-end restaurant directory data — drives `/restaurants/` and
 * `/restaurants/[urlSlug]/` pages.
 *
 * Distinct from `mock-merchants.ts` (which serves the B2B partner-showcase
 * at `/` with metrics/story/quote content). Same 3 partners but C-end fields
 * (hours, address, phone, gallery) live here.
 *
 * Data sources (2026-05-26):
 *   - Hours / address / phone scraped from
 *     `hairacoon-seo/store_apps/<slug>/src/data/restaurant.ts`
 *   - Hero images reused from `public/partners/<slug>.{jpg,png}`
 *     (originally placed there for the B2B page)
 *   - Gallery images copied from each store's
 *     `public/{dishes,menu-images,menu-item-images}/` into
 *     `public/restaurants/<slug>-N.jpg`
 *   - C-end blurbs written here (intentionally different from the B2B
 *     "they joined Hiraccoon" story copy — different audience, also avoids
 *     duplicate-content SEO collisions with the subdomain ordering site)
 */

export type CuisineSlug =
  | 'chinese-buffet'
  | 'mochi-donut'
  | 'chinese-american';

/** A flat, human-readable schedule line. Edit by hand; no parsing layer. */
export type HoursLine = string;

export interface Restaurant {
  /**
   * Internal id. Must match (1) the `/partners-grid/<slug>` logo if any,
   * (2) the partner entry in `mock-merchants.ts`.
   * Does NOT necessarily match the Supabase merchants slug — that's
   * stored separately in `claimCouponPath`.
   */
  slug: string;
  name: string;

  // Categorization
  cuisine: string;          // human label, e.g. "Chinese Buffet"
  cuisineSlug: CuisineSlug; // for future /cuisines/ pages

  // Location
  city: string;             // "Wood River"
  state: string;            // 2-letter, "IL"
  address: {
    street: string;
    full: string;           // one-line display
  };
  phone: string;            // display format, e.g. "(618) 258-1888"

  // Schedule
  hours: HoursLine[];

  // Story (C-end voice — why a customer should eat here)
  blurb: string[];

  // Visual
  logo?: string;            // /partners/logo-<slug>.{jpg,png}
  heroImage: string;        // /partners/<slug>.{jpg,png}
  galleryImages: string[];  // /restaurants/<slug>-N.jpg

  // Outbound
  orderUrl: string;         // https://bestbuffet.hiraccoon.com
  /**
   * Path to the existing /[slug]/ claim-coupon page on hiraccoon.com.
   * This IS the Supabase merchants slug. May differ from `slug` field
   * above (e.g. Mochinut's Supabase slug is the longer
   * 'mochinut-orlando-millenia').
   */
  claimCouponPath: string;

  // SEO overrides (manually written per page — avoid template noise)
  metaTitle?: string;
  metaDescription?: string;
}

export const RESTAURANTS: Restaurant[] = [
  {
    slug: 'best-buffet',
    name: 'Best Buffet & Grill',
    cuisine: 'Chinese Buffet',
    cuisineSlug: 'chinese-buffet',
    city: 'Wood River',
    state: 'IL',
    address: {
      street: '615 Wesley Dr',
      full: '615 Wesley Dr, Wood River, IL 62095',
    },
    phone: '(618) 258-1888',
    hours: [
      'Mon–Sun · 11:00 AM – 9:00 PM',
    ],
    blurb: [
      'An all-you-can-eat hibachi and sushi spread in Wood River, with 200+ dishes rotating across the line. Lunch and dinner same flat price, open seven days a week.',
      'Order pickup directly through Hiraccoon — no delivery markup, no third-party fees taken out of the kitchen.',
    ],
    logo: '/partners/logo-bestbuffet.jpg',
    heroImage: '/partners/bestbuffet.jpg',
    galleryImages: [
      '/restaurants/best-buffet-1.jpg',
      '/restaurants/best-buffet-2.jpg',
    ],
    orderUrl: 'https://bestbuffet.hiraccoon.com',
    claimCouponPath: '/best-buffet',
    metaTitle: 'Best Buffet & Grill — Chinese Buffet in Wood River, IL',
    metaDescription:
      'Order pickup from Best Buffet & Grill, an all-you-can-eat hibachi and sushi buffet in Wood River, IL. Open daily 11 AM – 9 PM.',
  },
  {
    slug: 'mochinut',
    name: 'Mochinut Orlando Millenia',
    cuisine: 'Mochi Donut · Korean Corn Dogs · Boba',
    cuisineSlug: 'mochi-donut',
    city: 'Orlando',
    state: 'FL',
    address: {
      street: '4693 Gardens Park Blvd',
      full: '4693 Gardens Park Blvd, Orlando, FL 32839',
    },
    phone: '(407) 868-8610',
    hours: [
      'Mon–Thu · 11:00 AM – 9:00 PM',
      'Fri–Sat · 11:00 AM – 10:00 PM',
      'Sun · 11:00 AM – 9:00 PM',
    ],
    blurb: [
      "Orlando's Millenia outpost of the viral mochi donut chain. Chewy mochi rings, crispy Korean corn dogs in five different coatings, and house-pulled boba teas.",
      'Order pickup through Hiraccoon — same-day fresh, no DoorDash markup, your dollar stays with the shop.',
    ],
    logo: '/partners/logo-mochinut.png',
    heroImage: '/partners/mochinut.png',
    galleryImages: [
      '/restaurants/mochinut-1.jpg',
      '/restaurants/mochinut-2.jpg',
      '/restaurants/mochinut-3.jpg',
    ],
    orderUrl: 'https://mochinut-orlando.hiraccoon.com',
    claimCouponPath: '/mochinut-orlando-millenia',
    metaTitle: 'Mochinut Orlando Millenia — Mochi Donuts & Korean Corn Dogs',
    metaDescription:
      "Order pickup from Mochinut Orlando Millenia: chewy mochi donuts, crispy Korean corn dogs, and house-pulled boba teas. Open daily, fresh same-day.",
  },
  {
    slug: 'chung-wah',
    name: 'Chung Wah Restaurant',
    cuisine: 'Chinese-American Kitchen',
    cuisineSlug: 'chinese-american',
    city: 'Baltimore',
    state: 'MD',
    address: {
      street: '5820 Johnnycake Rd',
      full: '5820 Johnnycake Rd, Baltimore, MD 21207',
    },
    phone: '(410) 788-6744',
    hours: [
      'Mon · Closed',
      'Tue–Thu · 11:00 AM – 9:30 PM',
      'Fri–Sat · 11:00 AM – 10:00 PM',
      'Sun · 12:00 PM – 9:30 PM',
    ],
    blurb: [
      "A Baltimore Chinese-American kitchen on Johnnycake Road since 1965. Lo mein, wings, classic combos that locals have been ordering for sixty years.",
      'Phone-in pickup has always worked here. Now you can also order online — straight to the kitchen, no third-party fees.',
    ],
    logo: '/partners/logo-chungwah.png',
    heroImage: '/partners/chungwah.jpg',
    galleryImages: [
      '/restaurants/chung-wah-1.jpg',
      '/restaurants/chung-wah-2.jpg',
    ],
    orderUrl: 'https://chungwah.hiraccoon.com',
    claimCouponPath: '/chungwah',
    metaTitle: 'Chung Wah Restaurant — Chinese-American in Baltimore, MD',
    metaDescription:
      'Order pickup from Chung Wah, a Baltimore Chinese-American kitchen on Johnnycake Road since 1965. Lo mein, wings, classic combos.',
  },
];

/** Build the URL slug for a restaurant: `<slug>-<city>-<state>` (lowercase). */
export function urlSlugFor(r: Restaurant): string {
  const cityPart = r.city.toLowerCase().replace(/\s+/g, '-');
  return `${r.slug}-${cityPart}-${r.state.toLowerCase()}`;
}

/** Look up a restaurant by its URL slug. Returns null if not found (→ 404). */
export function findRestaurantByUrlSlug(urlSlug: string): Restaurant | null {
  return RESTAURANTS.find((r) => urlSlugFor(r) === urlSlug) ?? null;
}
