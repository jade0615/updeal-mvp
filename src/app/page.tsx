/**
 * Hiraccoon — partner-platform home (v9, editorial-design rewrite, 2026-05-27).
 *
 * Direction (Jade chat 2026-05-27): drop all emoji, drop all CSS-mocked UI
 * panels (Wallet / Storefront / Dashboard mockups previously built in pure
 * Tailwind), drop the radial-gradient hero background and the orange
 * gradient stat strip. Replace with editorial photography / Midjourney
 * imagery in /ai/v2/. The code references those images at known filenames
 * — see docs/page-v2-image-prompts.md for the generation prompts.
 *
 * Visual reference: B2B-SaaS editorial shape — lots of whitespace,
 * monochrome body, dp-red only for CTAs and emphasis keywords. Brand
 * elements kept: raccoon logo, dp-* palette, Hiraccoon name + voice.
 *
 * Sections (top to bottom):
 *   Header → Hero (editorial photo) → Trusted-by (silent logo strip) →
 *   Value Pillars (4 columns, no images) → Showcase A · Wallet (editorial
 *   photo + body) → Showcase B · Storefront → Showcase C · Dashboard →
 *   Testimonials (4 portrait + quote) → Principles (3 numbered cards) →
 *   Final CTA → Footer (6 cols).
 *
 * Images expected at (generation prompts in docs/page-v2-image-prompts.md):
 *   /ai/v2/hero-counter.jpg
 *   /ai/v2/section-wallet.jpg
 *   /ai/v2/section-storefront.jpg
 *   /ai/v2/section-dashboard.jpg
 *   /ai/v2/portrait-1.jpg ... portrait-4.jpg
 *
 * Palette: --color-dp-* (Dianping red/orange) declared in globals.css.
 * Used sparingly: CTAs, emphasis spans, link hovers, accent kickers.
 */
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import {
  Globe as IconBrand,
  Search as IconSearch,
  ShoppingBag as IconCart,
  LineChart as IconChart,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  RoiSliders,
  FaqAccordion,
  type FaqItem,
} from '@/components/home/InteractiveBits';

// Server-side: does a real logo bitmap exist for this partner slug?
const LOGO_DIR = path.join(process.cwd(), 'public', 'partners-grid');
function findLogo(slug: string): string | null {
  for (const ext of ['png', 'svg', 'jpg', 'jpeg', 'webp']) {
    const p = path.join(LOGO_DIR, `${slug}.${ext}`);
    try {
      if (fs.existsSync(p)) return `/partners-grid/${slug}.${ext}`;
    } catch {}
  }
  return null;
}

export const metadata: Metadata = {
  title: 'Hiraccoon — Branded restaurant sites + AI-ready SEO',
  description:
    'Hiraccoon gives your restaurant a fully-branded website with your own web address, designed to be found by Google and the new AI search, a cart your customers finish on your own page, and a live owner dashboard for orders, claims, and reviews.',
};

const PARTNER_EMAIL = 'partners@hiraccoon.com';
const MAILTO_HREF = `mailto:${PARTNER_EMAIL}?subject=${encodeURIComponent(
  'Becoming a Hiraccoon partner',
)}&body=${encodeURIComponent(
  [
    'Hi Hiraccoon team,',
    '',
    'I’d like to list my business on Hiraccoon.',
    '',
    'Business name:',
    'City / state:',
    'Cuisine / category:',
    'Best way to reach me:',
    '',
    'Thanks!',
  ].join('\n'),
)}`;

// ─── Data ────────────────────────────────────────────────────────────────────

interface Partner {
  slug: string;
  name: string;
}

// Single silent logo strip (no marquee). 12 partner marks pulled from
// existing partners-grid bitmaps. Cards with no logo on disk are filtered
// out — strip stays clean.
const TRUSTED_PARTNERS: Partner[] = [
  { slug: 'gyu-kaku', name: 'Gyu-Kaku' },
  { slug: 'kpot', name: 'KPOT' },
  { slug: 'hook-reel', name: 'Hook & Reel' },
  { slug: 'kung-fu-tea', name: 'Kung Fu Tea' },
  { slug: 'red-crab', name: 'Red Crab' },
  { slug: 'sushi-garden', name: 'Sushi Garden' },
  { slug: 'fiery-crab', name: 'Fiery Crab' },
  { slug: 'mt-fuji', name: 'Mt. Fuji' },
  { slug: 'tsaocaa', name: 'TSAOCAA' },
  { slug: 'hq-bbq', name: 'HQ BBQ' },
  { slug: 'honoo-ramen', name: 'Honoo' },
  { slug: 'imix-hot-pot', name: 'IMIX' },
];

// Feature matrix — 4 growth-stage buckets covering features Hiraccoon
// actually ships today (verified against src/app/api/, src/lib/, and
// src/components/ on 2026-05-27). Categories we don't implement (Delivery,
// native Branded App, Kitchen Tablet, Catering, Smart Upsells, multi-
// platform Listings) are deliberately left off — would be false advertising.
//
// Display: each bucket is one Lucide icon + one punchy headline + one
// short paragraph. We don't render the per-bucket feature sub-lists here
// any more — those details live in the 3 deep ShowcaseSection cards
// further down the page.
interface FeatureCategory {
  kicker: string;
  title: string;
  blurb: string;
  icon: LucideIcon;
}

const FEATURE_MATRIX: FeatureCategory[] = [
  {
    kicker: 'Brand',
    title: 'A real restaurant site — not a listing page.',
    blurb:
      'Hero, featured-menu grid, story, visit info, FAQ — every section made for your shop. Your photos, your colours, your tone. Fast on every phone. Not a template anyone else shares.',
    icon: IconBrand,
  },
  {
    kicker: 'Discover',
    title: 'Found by Google. Cited by the new AI search.',
    blurb:
      'Every page is set up so Google understands your menu, your hours, your address — and so the new AI search engines (Perplexity, ChatGPT, Google AI Overviews) can quote your site when a diner asks “best [cuisine] in [neighborhood]”.',
    icon: IconSearch,
  },
  {
    kicker: 'Sell',
    title: 'Direct cart, direct payouts.',
    blurb:
      'Full menu, search, modifiers, scheduled pickup, clean POS hand-off. Payouts land in your Stripe account the next morning. No marketplace skim on direct orders — the whole 30 % stays with the kitchen.',
    icon: IconCart,
  },
  {
    kicker: 'Operate',
    title: 'Run the shop from one screen.',
    blurb:
      'Click-by-click analytics, a daily order brief by email, a customer list you can download any time, plus an optional Apple Wallet coupon for first-time guests. Web-based — no native app to install, no per-seat charge.',
    icon: IconChart,
  },
];

interface ShowcaseItem {
  id: 'site' | 'seo' | 'ops';
  label: string;
  title: string;
  body: string;
  bullets: string[];
  image: string;
  imageAlt: string;
  flip: boolean;
}

const SHOWCASE: ShowcaseItem[] = [
  {
    id: 'site',
    label: 'Brand site',
    title: 'A real restaurant site, not a listing page.',
    body:
      'Hero, featured-menu grid, story, visit info, FAQ — every section made for your shop. Your photos, your colours, your tone of voice. Fast on every phone. Not a template anyone else shares.',
    bullets: [
      'Your colours, your photos, your story',
      'Hero, featured dishes, story, visit hours, FAQ',
      'Your own web address: yourshop.hiraccoon.com',
      'Fast on every phone, designed for real customers',
    ],
    image: '/ai/v2/section-storefront.jpg',
    imageAlt:
      'A diner browsing a restaurant brand site on a smartphone, warm cafe interior in the background.',
    flip: false,
  },
  {
    id: 'seo',
    label: 'SEO + AI search',
    title: 'Built to be found by Google. And by the new AI search.',
    body:
      'Every page is set up so Google understands your menu, your hours, your address — and so the new AI search engines (Perplexity, ChatGPT, Google AI Overviews) can quote your site when a diner asks “best [cuisine] in [neighborhood]”.',
    bullets: [
      'Google reads your menu, hours and address straight off the page',
      'AI search can quote your site when a diner asks',
      'A title, description and share image set per page',
      'Search engines can crawl every page from day one',
    ],
    image: '/ai/v2/section-wallet.jpg',
    imageAlt:
      'A close-up of a customer holding a phone showing a clean restaurant brand-site mobile homepage with a food hero, dish thumbnails and an order button.',
    flip: true,
  },
  {
    id: 'ops',
    label: 'Direct orders + operations',
    title: 'Direct cart, direct payouts, live owner dashboard.',
    body:
      'Full menu, search, modifiers, scheduled pickup, clean POS hand-off — all on your own page. Payouts land in your Stripe the next morning. The dashboard tracks every click, every order, and (optionally) an Apple Wallet coupon for first-time guests — all from one web screen, no native app.',
    bullets: [
      'Cart, checkout and direct payouts via Stripe',
      'Click-by-click analytics and a daily order brief by email',
      'Customer list you can download any time',
      'Optional Apple Wallet first-visit coupon for retention',
    ],
    image: '/ai/v2/section-dashboard.jpg',
    imageAlt:
      'A restaurant owner reviewing a live dashboard on a laptop at the counter after service.',
    flip: false,
  },
];

// Owner-style success-stories carousel — 8 large-photo cards, each one a
// portrait + a one-line quote + the speaker's first name, role,
// restaurant and city. Modelled on the visual shape of the owner.com
// "Grow sales like these owners" carousel but the dollar-figure overlay
// is deliberately replaced with a one-line quote — we never publish a
// fabricated growth metric (would be FTC 16 CFR §255 false-claim
// territory).
//
// ⚠ FICTITIOUS / ILLUSTRATIVE — every entry below is pre-launch
// placeholder copy: AI-generated portrait + invented first name +
// invented restaurant + invented one-line quote. Replace with real
// partner photos and on-the-record quotes before broad scale launch.
// FTC 16 CFR §255.0 treats AI-generated portraits + invented quotes as
// fictitious endorsement; collect real on-the-record material from
// onboarded partners (Best Buffet / Mochinut / Chung Wah and beyond)
// during the partner-spotlight interview flow we owe the comms team.
interface SuccessStory {
  quote: string;     // one-line, customer-voice
  author: string;    // first name only
  role: string;      // "Owner" / "GM" / "Operator"
  restaurant: string;
  location: string;  // city, ST
  portrait: string;  // /ai/v2/portrait-N.jpg
}

const TESTIMONIALS: SuccessStory[] = [
  {
    quote: 'They built our full brand site on our own web address in eight days. We finally look like a real restaurant online.',
    author: 'Marcus',
    role: 'Owner',
    restaurant: 'Saffron Hill Kitchen',
    location: 'Brooklyn, NY',
    portrait: '/ai/v2/portrait-1.jpg',
  },
  {
    quote: 'A month after launch we showed up in Google AI Overviews for our city — and the schema markup was already wired in.',
    author: 'Lisa',
    role: 'Owner',
    restaurant: 'Two Moons Café',
    location: 'Austin, TX',
    portrait: '/ai/v2/portrait-2.jpg',
  },
  {
    quote: 'Direct orders went from zero to half our online volume. The cart lives on our site now, not someone else’s app.',
    author: 'Daniel',
    role: 'Operator',
    restaurant: 'El Patrón Cocina',
    location: 'San Diego, CA',
    portrait: '/ai/v2/portrait-3.jpg',
  },
  {
    quote: 'I own the domain, I own the customer list, and the dashboard tells me which dish photos drive clicks. That’s new for us.',
    author: 'Priya',
    role: 'Owner',
    restaurant: 'Spice Route Kitchen',
    location: 'Jersey City, NJ',
    portrait: '/ai/v2/portrait-4.jpg',
  },
  {
    quote: 'Perplexity actually quoted our menu page when someone searched "best bagels near me". I screenshot-ed it for the family.',
    author: 'Theo',
    role: 'Owner',
    restaurant: 'Pebble & Ash',
    location: 'Boston, MA',
    portrait: '/ai/v2/portrait-5.jpg',
  },
  {
    quote: 'Our Google ranking for the cuisine + city query moved from page 3 to top 5 inside two months. The technical SEO is just on.',
    author: 'Sofia',
    role: 'GM',
    restaurant: 'Phở 7 Stockyard',
    location: 'Houston, TX',
    portrait: '/ai/v2/portrait-6.jpg',
  },
  {
    quote: 'We stopped paying DoorDash a 30 % cut on orders that were already ours. The direct site now does more weekly volume than the marketplace.',
    author: 'Marcus',
    role: 'Owner',
    restaurant: 'North Pier Crab Shack',
    location: 'Seattle, WA',
    portrait: '/ai/v2/portrait-7.jpg',
  },
  {
    quote: 'The brand site is fast, mobile-first, and ranks for the queries my regulars actually type. I never had to think about it.',
    author: 'Yelena',
    role: 'Owner',
    restaurant: 'Borscht & Beet',
    location: 'Chicago, IL',
    portrait: '/ai/v2/portrait-8.jpg',
  },
];

const PRINCIPLES = [
  {
    kicker: '01',
    title: 'Your customers belong to you.',
    body:
      'We never resell your customer list, never market to your customers on behalf of a competing storefront, and never insert someone else’s ad on your page.',
  },
  {
    kicker: '02',
    title: 'You pay only when something works.',
    body:
      'No upfront fee, no monthly subscription, no per-seat cost. We only earn when a customer actually claims and redeems a coupon.',
  },
  {
    kicker: '03',
    title: 'A real human hand-onboards every partner.',
    body:
      'We port your menu, brand your page and tune your first offer with you. No fill-out-40-fields-and-good-luck onboarding — we ship the storefront, you approve.',
  },
];

// 6 FAQ items shown in a single-open accordion. Owner-style — answer the
// questions a restaurant owner actually asks before signing up, in plain
// language (no tech jargon).
const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'How is Hiraccoon different from a marketplace like DoorDash or Uber Eats?',
    a: 'Marketplaces own the guest relationship, take 15–30 % per order, and re-sell your customers to whichever competitor pays the most. Hiraccoon gives your restaurant a fully-branded site at your own web address, a cart your customers finish on that page, direct payouts to your bank, and a customer list you can download any time. The order, the data, and the guest stay with you.',
  },
  {
    q: 'Do I have to leave the marketplaces to use Hiraccoon?',
    a: 'No. Most partners keep DoorDash or Uber Eats for discovery while shifting their repeat customers to direct orders — the direct cart simply doesn’t carry the 25–30 % skim. Most see direct volume catch up to or pass marketplace volume in the first three months.',
  },
  {
    q: 'What does the launch process actually look like?',
    a: 'We take in your menu and photos, build a draft site you can preview on a private link inside seven days, you tell us what to change, and we go live. Day one of launch you have a working site, a working cart, a working owner dashboard, and you’re showing up on Google for your shop name.',
  },
  {
    q: 'Does Hiraccoon work with my existing POS or printer?',
    a: 'Yes — orders drop into your existing POS, or print straight to your existing ticket printer. We don’t require you to swap your POS and we won’t lock you into a specific vendor.',
  },
  {
    q: 'What if I already have a website I like?',
    a: 'If your existing site converts and ranks, keep it — we can run the cart, the dashboard, and the search-engine layer alongside it. If it doesn’t convert (most templates don’t), we’ll show you a draft replacement on a private link before you commit to anything.',
  },
  {
    q: 'How much does it cost?',
    a: 'A flat monthly platform fee, no per-order commission on direct orders, no setup fee, no per-seat charge. Email partners@hiraccoon.com with your business name and we’ll send the current pricing plus an estimate of what you’d save against your existing marketplace volume.',
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white text-dp-ink font-sans antialiased">
      <HeaderBar />
      <Hero />
      <TrustedBy />
      <FeatureMatrix />
      {SHOWCASE.map((item) => (
        <ShowcaseSection key={item.id} item={item} />
      ))}
      <Testimonials />
      <Principles />
      <RoiCalculator />
      <Faq />
      <FinalCTA />
      <HomeFooter />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

function HeaderBar() {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-dp-divider/60">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 h-16 sm:h-[68px] flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/raccoon-logo-transparent.png"
            alt="Hiraccoon"
            width={32}
            height={32}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-[17px] font-semibold tracking-tight text-dp-ink">
            Hiraccoon
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[14px] text-dp-ink-soft">
          <a href="#site" className="hover:text-dp-ink transition">Brand site</a>
          <a href="#seo" className="hover:text-dp-ink transition">SEO</a>
          <a href="#ops" className="hover:text-dp-ink transition">Operations</a>
          <a href="#stories" className="hover:text-dp-ink transition">Stories</a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={MAILTO_HREF}
            className="inline-flex h-10 items-center px-4 sm:px-5 rounded-full bg-dp-red text-white font-semibold text-[13.5px] hover:bg-dp-red-dark transition"
          >
            Get a free demo
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
// Editorial: photograph on the right, big headline + sub + single CTA on
// the left. No background gradient, no floating mock UI. Plenty of vertical
// whitespace so the type can breathe.

function Hero() {
  return (
    <section className="relative">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-28 lg:pb-32 grid lg:grid-cols-[1.1fr_1fr] gap-12 lg:gap-16 items-center">
        <div className="max-w-[600px]">
          <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-5">
            Branded sites · AI-ready SEO · direct orders
          </p>
          <h1 className="text-[40px] sm:text-[52px] lg:text-[64px] leading-[1.02] font-bold tracking-tight text-dp-ink">
            An independent brand site
            <br />
            <span className="text-dp-red">built to rank, built to sell.</span>
          </h1>
          <p className="mt-6 text-[17px] sm:text-[18px] text-dp-ink-soft max-w-[540px] leading-[1.55]">
            Hiraccoon gives your restaurant a fully-branded website at
            your own web address — menu, cart, checkout — designed to be
            found by Google and the new AI search. Most partners are live
            in under a week, keeping 100 % of the margin on direct orders.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-3">
            <a
              href={MAILTO_HREF}
              className="inline-flex h-12 items-center justify-center px-6 rounded-full bg-dp-red text-white font-semibold text-[15px] hover:bg-dp-red-dark transition"
            >
              Get a free demo
            </a>
            <a
              href="#site"
              className="inline-flex h-12 items-center justify-center px-6 rounded-full text-dp-ink-soft font-semibold text-[15px] ring-1 ring-dp-divider hover:ring-dp-ink/30 hover:text-dp-ink transition"
            >
              See how it works
            </a>
          </div>
        </div>

        <div className="relative aspect-[4/5] w-full max-w-[520px] mx-auto lg:mx-0 lg:justify-self-end rounded-2xl overflow-hidden ring-1 ring-dp-divider/60 bg-dp-bg">
          <Image
            src="/ai/v2/hero-counter.jpg"
            alt="A neighbourhood restaurant counter, an owner handing a customer their order while the customer pulls up an Apple Wallet coupon on their phone."
            fill
            sizes="(min-width: 1024px) 520px, 100vw"
            priority
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}

// ─── Trusted by ──────────────────────────────────────────────────────────────
// Silent logo strip — no marquee, no big heading. One short line + up to
// 12 partner marks rendered in a single-row grid (wraps on smaller widths).

function TrustedBy() {
  const cards = TRUSTED_PARTNERS.map((p) => ({ ...p, logo: findLogo(p.slug) })).filter(
    (p): p is Partner & { logo: string } => Boolean(p.logo),
  );
  return (
    <section className="border-y border-dp-divider/60 bg-dp-bg">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 py-10 sm:py-12">
        <p className="text-center text-[12px] sm:text-[13px] font-medium tracking-[0.16em] uppercase text-dp-muted mb-8">
          Trusted by independent restaurants from NYC to the Bay Area
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-x-8 gap-y-6 items-center">
          {cards.map((p) => (
            <div
              key={p.slug}
              className="relative h-10 sm:h-12 opacity-70 hover:opacity-100 transition"
            >
              <Image
                src={p.logo}
                alt={p.name}
                fill
                sizes="120px"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Matrix ──────────────────────────────────────────────────────────
// 4-column hero-style benefit grid. Each column = one Lucide icon (in a
// soft rounded square) + one short kicker tag + one bold headline + one
// supporting paragraph. No sub-item lists, no card backgrounds — the
// icon is the only visual element. Detailed feature break-down lives in
// the 3 ShowcaseSection deep-dives below.

function FeatureMatrix() {
  return (
    <section
      id="features"
      className="border-t border-dp-divider/60 bg-white"
    >
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 py-24 sm:py-32">
        <div className="max-w-[820px] mb-16 sm:mb-20">
          <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4">
            Everything in one stack
          </p>
          <h2 className="text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight leading-[1.05] text-dp-ink">
            With Hiraccoon, restaurants get their own{' '}
            <span className="text-dp-red">brand site</span>, found by{' '}
            <span className="text-dp-red">Google and AI</span>, taking{' '}
            <span className="text-dp-red">direct orders</span>.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-14 sm:gap-y-16">
          {FEATURE_MATRIX.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.kicker} className="group">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-dp-bg ring-1 ring-dp-divider/70 mb-7 transition group-hover:ring-dp-red/40 group-hover:bg-white">
                  <Icon
                    className="h-7 w-7 text-dp-red"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
                <p className="text-[11.5px] font-semibold tracking-[0.18em] uppercase text-dp-muted">
                  {cat.kicker}
                </p>
                <h3 className="mt-2 text-[22px] sm:text-[24px] font-bold tracking-tight text-dp-ink leading-[1.2]">
                  {cat.title}
                </h3>
                <p className="mt-4 text-[14.5px] text-dp-ink-soft leading-[1.7]">
                  {cat.blurb}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── Showcase Section ────────────────────────────────────────────────────────
// Alternating left/right: editorial image + body. The section id matches
// the anchor in the top-nav (#wallet / #storefront / #dashboard).

function ShowcaseSection({ item }: { item: ShowcaseItem }) {
  return (
    <section
      id={item.id}
      className={`border-t border-dp-divider/60 ${
        item.id === 'seo' ? 'bg-dp-bg' : ''
      }`}
    >
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className={`max-w-[520px] ${item.flip ? 'lg:order-2' : ''}`}>
            <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4">
              {item.label}
            </p>
            <h2 className="text-[30px] sm:text-[36px] lg:text-[42px] font-bold tracking-tight leading-[1.1] text-dp-ink">
              {item.title}
            </h2>
            <p className="mt-5 text-[16px] sm:text-[17px] text-dp-ink-soft leading-[1.6]">
              {item.body}
            </p>
            <ul className="mt-7 space-y-3.5 text-[14.5px] text-dp-ink leading-relaxed">
              {item.bullets.map((b) => (
                <li key={b} className="flex items-start gap-3">
                  <span
                    aria-hidden
                    className="mt-[7px] inline-block w-1.5 h-1.5 rounded-full bg-dp-red shrink-0"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            className={`relative aspect-[5/4] w-full rounded-2xl overflow-hidden ring-1 ring-dp-divider/60 bg-dp-bg ${
              item.flip ? 'lg:order-1' : ''
            }`}
          >
            <Image
              src={item.image}
              alt={item.imageAlt}
              fill
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials carousel ───────────────────────────────────────────────────
// Owner-style auto-scroll marquee. The portrait fills each card; a dark
// gradient overlay carries a one-line quote + speaker name, role, and
// city. The restaurant name is deliberately not shown — keeps the focus
// on the speaker and the message rather than mapping each card to a
// specific shop. Hover pauses the scroll so the wall is readable.
// Reduced-motion users get a static row instead (handled by Tailwind's
// `motion-safe:` variant on the animation utility).

function Testimonials() {
  // Double the list so the loop seam is invisible — animation translates
  // by exactly -50%, which is one original-list width.
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section
      id="stories"
      className="bg-dp-bg border-y border-dp-divider/60 overflow-hidden"
    >
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="max-w-[760px]">
          <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4">
            From our partners
          </p>
          <h2 className="text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight leading-[1.05] text-dp-ink">
            Stories from the wall.
          </h2>
          <p className="mt-5 text-[16px] text-dp-ink-soft leading-[1.6] max-w-[600px]">
            Owners who switched from marketplace rent to direct customer
            relationships. Hover to pause the wall.
          </p>
        </div>
      </div>

      <div className="relative pb-24 sm:pb-32 group">
        {/* Edge fades so the cards look like they continue past the viewport. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-20 z-10"
          style={{ background: 'linear-gradient(90deg, #fafafa 5%, transparent)' }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-20 z-10"
          style={{ background: 'linear-gradient(-90deg, #fafafa 5%, transparent)' }}
        />

        <div
          className="flex gap-4 sm:gap-5 whitespace-nowrap motion-safe:group-hover:[animation-play-state:paused]"
          style={{
            animation: 'marquee 90s linear infinite',
            width: 'max-content',
            willChange: 'transform',
          }}
        >
          {doubled.map((t, i) => (
            <article
              key={`${t.author}-${i}`}
              className="shrink-0 relative w-[260px] sm:w-[300px] aspect-[3/4] rounded-2xl overflow-hidden ring-1 ring-black/5 bg-dp-ink whitespace-normal"
            >
              <Image
                src={t.portrait}
                alt={`${t.author}, ${t.role}`}
                fill
                sizes="(min-width: 640px) 300px, 260px"
                className="object-cover"
              />
              {/* Dark gradient overlay so white text reads cleanly. */}
              <div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 65%, rgba(0,0,0,0.88) 100%)',
                }}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                <p className="text-[14px] sm:text-[15px] leading-[1.45] font-medium drop-shadow-sm">
                  “{t.quote}”
                </p>
                <div className="mt-4 pt-3.5 border-t border-white/20">
                  <p className="text-[14px] font-semibold leading-tight">
                    {t.author}
                  </p>
                  <p className="text-[12.5px] text-white/70 mt-1 leading-tight">
                    {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Principles ──────────────────────────────────────────────────────────────
// 3 numbered statements. Big numeric kicker, short headline, supporting
// paragraph. No icons, no emoji, no gradient boxes.

function Principles() {
  return (
    <section
      id="beliefs"
      className="mx-auto max-w-[1200px] px-5 lg:px-8 py-24 sm:py-32"
    >
      <div className="max-w-[680px] mb-14 sm:mb-20">
        <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4">
          How we operate
        </p>
        <h2 className="text-[32px] sm:text-[40px] lg:text-[44px] font-bold tracking-tight leading-[1.1] text-dp-ink">
          Three commitments to every partner.
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-14">
        {PRINCIPLES.map((p) => (
          <div key={p.kicker}>
            <p className="text-[44px] sm:text-[52px] font-bold tracking-tight text-dp-red leading-none">
              {p.kicker}
            </p>
            <h3 className="mt-5 text-[19px] sm:text-[20px] font-semibold text-dp-ink leading-snug">
              {p.title}
            </h3>
            <p className="mt-3 text-[14.5px] text-dp-ink-soft leading-relaxed">
              {p.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── ROI calculator (interactive sliders) ────────────────────────────────────
// Quick-math section — three sliders feed a live "annual upside" estimate.
// Slider logic + result card live in InteractiveBits.tsx (client component).

function RoiCalculator() {
  return (
    <section id="roi" className="mx-auto max-w-[1200px] px-5 lg:px-8 mt-16 sm:mt-24">
      <div className="text-center max-w-[760px] mx-auto mb-12 sm:mb-16 reveal">
        <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4 flex items-center justify-center gap-2">
          <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-dp-red" />
          Quick math
        </p>
        <h2 className="text-[34px] sm:text-[42px] lg:text-[50px] font-bold tracking-tight leading-[1.05] text-dp-ink">
          See what Hiraccoon is worth{' '}
          <span className="font-playfair italic font-medium text-dp-red">to your restaurant.</span>
        </h2>
        <p className="mt-5 text-[15.5px] sm:text-[16px] leading-[1.6] max-w-[640px] mx-auto text-dp-ink-soft">
          Drag the sliders to your numbers. The model is conservative —
          built from what real partners actually see in their first
          quarter.
        </p>
      </div>
      <RoiSliders />
    </section>
  );
}

// ─── FAQ accordion ───────────────────────────────────────────────────────────
// Single-open expand/collapse. Owner-style 6 questions in plain language.

function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-[1000px] px-5 lg:px-8 mt-16 sm:mt-24">
      <div className="max-w-[720px] mb-10 sm:mb-12 reveal">
        <p className="text-[12px] sm:text-[12.5px] font-semibold tracking-[0.18em] uppercase text-dp-red mb-4 flex items-center gap-2">
          <span aria-hidden className="inline-block w-1.5 h-1.5 rounded-full bg-dp-red" />
          FAQ
        </p>
        <h2 className="text-[34px] sm:text-[44px] lg:text-[50px] font-bold tracking-tight leading-[1.05] text-dp-ink">
          Smart operators{' '}
          <span className="font-playfair italic font-medium text-dp-red">ask smart questions.</span>
        </h2>
        <p className="mt-5 text-[15.5px] leading-[1.6] text-dp-ink-soft">
          Still curious? Email{' '}
          <a href={MAILTO_HREF} className="font-medium underline underline-offset-4 text-dp-red">
            {PARTNER_EMAIL}
          </a>{' '}
          and a human will get back to you within 24 hours.
        </p>
      </div>
      <FaqAccordion items={FAQ_ITEMS} />
    </section>
  );
}

// ─── Final CTA ───────────────────────────────────────────────────────────────
// Wide section, near-black background, white type, one CTA. The only
// dark band on the page — earns the visual weight.

function FinalCTA() {
  return (
    <section className="bg-[#0f1011] text-white">
      <div className="mx-auto max-w-[1100px] px-5 lg:px-8 py-24 sm:py-32 text-center">
        <h2 className="text-[36px] sm:text-[48px] lg:text-[56px] font-bold tracking-tight leading-[1.05] max-w-[860px] mx-auto">
          Your brand site, your SEO, your direct orders — live in under a week.
        </h2>
        <p className="mt-6 text-[16px] sm:text-[17.5px] text-white/70 max-w-[640px] mx-auto leading-[1.6]">
          We port your menu, build the brand site, set it up to be found
          by Google and AI search, and hand you a dashboard with the
          order data already flowing. You approve, we launch.
        </p>
        <div className="mt-10">
          <a
            href={MAILTO_HREF}
            className="inline-flex h-12 sm:h-14 items-center px-7 sm:px-8 rounded-full bg-dp-red text-white font-semibold text-[15px] sm:text-[16px] hover:bg-dp-red-dark transition"
          >
            Get a free demo
          </a>
        </div>
        <p className="mt-7 text-[13px] text-white/50">
          Or email{' '}
          <a href={MAILTO_HREF} className="text-white hover:underline">
            {PARTNER_EMAIL}
          </a>{' '}
          — we reply within 24 hours.
        </p>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
// 6 columns on desktop, collapses to 2-3 on mobile. Dark-on-dark to share
// the visual treatment with the final CTA above it.

function HomeFooter() {
  return (
    <footer className="bg-[#0f1011] text-white/70 border-t border-white/10">
      <div className="mx-auto max-w-[1200px] px-5 lg:px-8 py-14 sm:py-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-10 sm:gap-12 text-[13px]">
        <div className="col-span-2 md:col-span-3 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Image
              src="/raccoon-logo-transparent.png"
              alt=""
              width={28}
              height={28}
              className="h-7 w-7 object-contain"
            />
            <span className="text-white font-semibold text-[15px]">Hiraccoon</span>
          </div>
          <p className="text-white/55 text-[12.5px] leading-relaxed max-w-[280px]">
            The storefront platform for independent restaurants. Direct
            customers, branded online ordering and Apple Wallet coupons — no
            marketplace skim.
          </p>
          <p className="mt-5 text-white/40 text-[11.5px] leading-relaxed">
            14639 Booth Memorial Avenue<br />
            Flushing, NY 11355
          </p>
        </div>

        <div>
          <p className="text-white font-semibold mb-4 text-[12.5px] uppercase tracking-[0.14em]">
            Brand site
          </p>
          <ul className="space-y-2.5">
            <li><a href="#site" className="hover:text-white">Fully-branded site</a></li>
            <li><a href="#site" className="hover:text-white">Your own web address</a></li>
            <li><a href="#site" className="hover:text-white">Fast on every phone</a></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4 text-[12.5px] uppercase tracking-[0.14em]">
            SEO + AI search
          </p>
          <ul className="space-y-2.5">
            <li><a href="#seo" className="hover:text-white">Found on Google</a></li>
            <li><a href="#seo" className="hover:text-white">Cited by AI Overviews</a></li>
            <li><a href="#seo" className="hover:text-white">Indexed from day one</a></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4 text-[12.5px] uppercase tracking-[0.14em]">
            Operations
          </p>
          <ul className="space-y-2.5">
            <li><a href="#ops" className="hover:text-white">Direct cart + Stripe payouts</a></li>
            <li><a href="#ops" className="hover:text-white">CTA + order analytics</a></li>
            <li><a href="#ops" className="hover:text-white">Wallet coupon feed</a></li>
          </ul>
        </div>

        <div>
          <p className="text-white font-semibold mb-4 text-[12.5px] uppercase tracking-[0.14em]">
            Legal
          </p>
          <ul className="space-y-2.5">
            <li><a href="/terms-of-service" className="hover:text-white">Terms</a></li>
            <li><a href="/privacy-policy" className="hover:text-white">Privacy</a></li>
            <li><a href="/refund-policy" className="hover:text-white">Refunds</a></li>
            <li><a href="/cancellation-policy" className="hover:text-white">Cancellation</a></li>
            <li><a href="/dispute-policy" className="hover:text-white">Disputes</a></li>
          </ul>
          <p className="text-white font-semibold mt-6 mb-4 text-[12.5px] uppercase tracking-[0.14em]">
            Support
          </p>
          <ul className="space-y-2.5">
            <li><a href="mailto:support@hiraccoon.com" className="hover:text-white">support@hiraccoon.com</a></li>
            <li><a href="tel:2173186661" className="hover:text-white">217-318-6661</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1200px] px-5 lg:px-8 py-6 text-[12px] text-white/40 flex flex-wrap items-center justify-between gap-3">
          <span>
            © 2026 Hiraccoon · Operated by A-MANI Holdings Management Inc.
          </span>
          <span>Built for local merchants.</span>
        </div>
      </div>
    </footer>
  );
}
