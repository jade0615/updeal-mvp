/**
 * Onboarded partner data for the B2B partner-showcase home page.
 *
 * The three partners below correspond 1:1 with the standalone Next.js apps
 * under hairacoon-seo/store_apps/ (bestbuffet / mochinut / chungwah). The
 * `externalUrl` for each points at the subdomain the standalone app is
 * (will be) deployed to. Story copy, rating "lift" percentages, and
 * first-month claim counts are PLACEHOLDER copy authored for the design
 * preview — replace with real numbers when shipping to production.
 *
 * Static facts (menu size, year established, city, real rating where known)
 * are sourced directly from each store_apps/<slug>/src/data/restaurant.ts.
 */

export type PartnerCategory = 'buffet' | 'dessert' | 'classic';

export interface PartnerSpotlight {
  slug: string;                 // routes to /[slug] (fallback if external not set)
  name: string;
  category: PartnerCategory;
  cuisine: string;
  city: string;
  state: string;
  rating: number;
  reviewCount: number;
  establishedYear: number;
  story: string[];              // 2-3 sentence paragraphs (placeholder copy)
  metrics: { label: string; value: string }[];
  emoji: string;                // fallback / accent (used in testimonial avatar)
  heroImage: string;            // public/partners/<slug>.* — used by spotlight + logo strip
  heroAlt: string;              // alt text for the hero photo
  externalUrl?: string;         // standalone deployed subdomain (preferred)
}

/** Per-partner gradient used for placeholder card hero (no real photos yet). */
export const PARTNER_GRADIENT: Record<PartnerCategory, string> = {
  buffet: 'linear-gradient(135deg, #FF8866 0%, #FF503C 60%, #C0392B 100%)',
  dessert: 'linear-gradient(135deg, #FFB199 0%, #FF6B9A 60%, #FF3D7F 100%)',
  classic: 'linear-gradient(135deg, #FFC371 0%, #FF8800 60%, #B7791F 100%)',
};

export const PARTNER_LABEL: Record<PartnerCategory, string> = {
  buffet: 'Chinese · Buffet',
  dessert: 'Mochi Donut · Korean Corndog',
  classic: 'Chinese · American Kitchen',
};

export const SPOTLIGHTS: PartnerSpotlight[] = [
  {
    slug: 'best-buffet',
    name: 'Best Buffet & Grill',
    category: 'buffet',
    cuisine: 'Chinese · All-You-Can-Eat Hibachi & Sushi',
    city: 'Wood River',
    state: 'IL',
    rating: 4.2,
    reviewCount: 180,
    establishedYear: 2014,
    story: [
      'Best Buffet runs a 218-dish hibachi-and-sushi spread in a former-mall site in Wood River. Tight margins, no in-house marketer.',
      'With Hiraccoon they shipped a branded ordering site, an Apple-Wallet first-visit coupon, and review prompts after redemption — all in under a week of onboarding.',
    ],
    metrics: [
      { label: 'Live menu', value: '218 dishes' },
      { label: 'First-month claims', value: '312' },
      { label: 'Repeat-visit lift', value: '+38%' },
    ],
    emoji: '🥢',
    heroImage: '/partners/bestbuffet.jpg',
    heroAlt: 'Best Buffet & Grill — buffet line with orange chicken, sushi, fried rice and stir-fried vegetables.',
    externalUrl: 'https://bestbuffet.hiraccoon.com',
  },
  {
    slug: 'mochinut-orlando-millenia',
    name: 'Mochinut Orlando Millenia',
    category: 'dessert',
    cuisine: 'Mochi Donut · Korean Corndog · Bubble Tea',
    city: 'Orlando',
    state: 'FL',
    rating: 4.7,
    reviewCount: 320,
    establishedYear: 2022,
    story: [
      'A franchise location of a viral mochi-donut chain — but franchisees don’t inherit the brand site, so Orlando Millenia opened with nothing more than a Google listing.',
      'Hiraccoon built a verified storefront, ported the full daily menu, and now powers their pickup ordering plus a weekly "drop" coupon that funnels foot traffic on slow weekdays.',
    ],
    metrics: [
      { label: 'Live menu', value: '54 items' },
      { label: 'Avg pickup time', value: '8 min' },
      { label: 'Weekday lift', value: '+22%' },
    ],
    emoji: '🍩',
    heroImage: '/partners/mochinut.png',
    heroAlt: 'Mochinut Orlando Millenia — two hands holding signature Mochinut bubble-tea cups topped with mochi donuts.',
    externalUrl: 'https://mochinut.hiraccoon.com',
  },
  {
    slug: 'chungwah',
    name: 'Chung Wah Restaurant',
    category: 'classic',
    cuisine: 'Chinese · American Kitchen · Baltimore Since 1965',
    city: 'Baltimore',
    state: 'MD',
    rating: 4.6,
    reviewCount: 42,
    establishedYear: 1965,
    story: [
      'Chung Wah has been serving Chinese-American kitchen classics from Baltimore’s Johnnycake Road since 1965. After six decades of word-of-mouth regulars, the owners wanted a clean online ordering experience without piling fees on every check.',
      'Hiraccoon shipped a verified storefront, ported the full 229-dish menu, and now powers their fee-free online pickup plus an Apple Wallet coupon for first-time customers.',
    ],
    metrics: [
      { label: 'Open since', value: '1965' },
      { label: 'Live menu', value: '229 dishes' },
      { label: 'Repeat-order lift', value: '+34%' },
    ],
    emoji: '🥡',
    heroImage: '/partners/chungwah.jpg',
    heroAlt: 'Chung Wah Restaurant — jumbo shrimp lo mein with carrots, shiitake mushrooms and scallions on a white platter.',
    externalUrl: 'https://chungwah.hiraccoon.com',
  },
];

/** Self-written testimonial placeholders — one per onboarded partner. */
export const TESTIMONIALS: { quote: string; author: string; role: string; slug: string }[] = [
  {
    quote:
      'We didn’t have time to learn another POS or marketing stack. Hiraccoon handed us a working storefront and a coupon flow in under a week — and we saw the repeat-visit numbers move within the first month.',
    author: 'Jin · GM',
    role: 'Best Buffet & Grill, Wood River IL',
    slug: 'best-buffet',
  },
  {
    quote:
      'Being a franchise we don’t get any web presence from corporate. Hiraccoon basically gave us the brand site we couldn’t build ourselves, plus a way to push slow-weekday promos that actually reach our customers’ phones.',
    author: 'Ann · Owner',
    role: 'Mochinut Orlando Millenia, FL',
    slug: 'mochinut-orlando-millenia',
  },
  {
    quote:
      'After 60 years of regulars finding us by word of mouth, we wanted a way to reach a new generation without learning some complicated dashboard. Hiraccoon set us up cleanly — and we kept full margins on every online order.',
    author: 'Wei · Owner',
    role: 'Chung Wah Restaurant, Baltimore MD',
    slug: 'chungwah',
  },
];

/** "Why partners choose Hiraccoon" — 4 feature cards. */
export const PARTNER_FEATURES: { icon: string; title: string; body: string }[] = [
  {
    icon: '🍎',
    title: 'Apple Wallet first',
    body:
      'Coupons land directly in your customer’s wallet. No app install, no signup gate, no abandoned carts.',
  },
  {
    icon: '🚀',
    title: 'Live in under a week',
    body:
      'We port your menu, brand your landing page, and ship the redemption flow — typically inside 5 business days.',
  },
  {
    icon: '💸',
    title: 'No upfront fees',
    body:
      'Pay only when customers claim. No subscription, no setup charge, no per-seat costs to worry about.',
  },
  {
    icon: '📊',
    title: 'Real-time analytics',
    body:
      'Track every claim, every redemption, and every repeat visit from a single owner dashboard.',
  },
];
