/**
 * Hiraccoon — partner-platform home (v8, owner.com-shape expanded).
 *
 * Direction (Jade chat 2026-05-25): copy owner.com's section structure, just
 * change the name + slight palette/style. Skip their AI-ranking section
 * (we don't ship that). Partner section is a simple logo+name row (no
 * detailed case studies). CTA is a single mailto click — no form.
 *
 * Sections retained from owner.com's homepage shape:
 *   Header → Hero → Trusted-by → Stats strip → Feature grid →
 *   Product showcase (3 alternating deep-dives) → Testimonials → Beliefs →
 *   Final CTA → Footer.
 *
 * Sections dropped (we have no source material for them):
 *   Capterra/G2 badges, video testimonials, CEO portrait + philosophy block,
 *   blog/resource carousel, YouTube CTA, AI search/ranking promo.
 *
 * Real partner data on this page is limited to the trusted-by row (3 names +
 * letter-mark logos + cities). Story / metric / quote content elsewhere is
 * PLACEHOLDER copy authored by us — replace with real numbers before ship.
 *
 * Palette: --color-dp-* (Dianping red/orange) declared in globals.css.
 */
import fs from 'node:fs';
import path from 'node:path';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

// Server-side check: is there a real logo bitmap for this partner slug?
// (Runs at module load on the Next.js server, fine for a static partner list.)
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
  title: 'Hiraccoon — The branded storefront + Wallet coupon platform for independent restaurants',
  description:
    'Hiraccoon ships a branded storefront, an Apple Wallet first-visit coupon and a real-time owner dashboard for independent restaurants — typically live in under a week.',
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

// Onboarded partners shown on the 3-row marquee. Each card renders as a clean
// white plaque with the real brand logo (when one was found and downloaded
// to public/partners-grid/<slug>.{png,svg,jpg}) and the English name. If no
// logo is on disk, the card falls back to a typographic name-only mark.
interface Partner {
  slug: string;       // file basename in public/partners-grid/
  name: string;       // English display name only
}

const PARTNER_ROW_1: Partner[] = [
  { slug: 'gyu-kaku', name: 'Gyu-Kaku' },
  { slug: 'kpot', name: 'KPOT' },
  { slug: 'hook-reel', name: 'Hook & Reel' },
  { slug: 'kung-fu-tea', name: 'Kung Fu Tea' },
  { slug: 'shaxian-snacks', name: 'Shaxian Snacks' },
  { slug: 'tsaocaa', name: 'TSAOCAA' },
  { slug: 'mt-fuji', name: 'Mt. Fuji' },
  { slug: 'red-crab', name: 'Red Crab Juicy Seafood' },
  { slug: 'hong-xing-lou', name: 'Hong Xing Lou' },
  { slug: 'sushi-garden', name: 'Sushi Garden' },
];

const PARTNER_ROW_2: Partner[] = [
  { slug: 'de-zhuang', name: 'De Zhuang Hotpot' },
  { slug: 'fiery-crab', name: 'Fiery Crab' },
  { slug: 'boom-boom-crab', name: 'Boom Boom Crab' },
  { slug: 'cajun-crab-hut', name: 'Cajun Crab Hut' },
  { slug: 'honoo-ramen', name: 'Honoo Ramen Bar' },
  { slug: 'takara', name: 'Takara' },
  { slug: 'uka-omakase', name: 'Uka Omakase' },
  { slug: 'shinya-shokudo', name: 'Shinya Shokudo' },
  { slug: 'imix-hot-pot', name: 'IMIX Hot Pot' },
  { slug: 'super-crab', name: 'Super Crab' },
];

const PARTNER_ROW_3: Partner[] = [
  { slug: 'hotpot-palace', name: 'Hotpot Palace' },
  { slug: 'hq-bbq', name: 'HQ BBQ' },
  { slug: 'abc-nail-spa', name: 'ABC Nail Spa' },
  { slug: 'crystal-nail', name: 'Crystal Nail' },
  { slug: 'la-queen', name: 'La Queen' },
  { slug: 'toudaotang', name: 'Toudaotang' },
  { slug: 'ding-dang', name: 'Ding Dang' },
  { slug: 'mimosa-nail', name: 'Mimosa Nail' },
  { slug: 'dv-spa', name: 'D&V Spa' },
  { slug: 'jbc-rice-noodles', name: 'JBC Rice Noodles' },
];

// Placeholder stats. Replace before shipping.
const STATS = [
  { value: 'Hundreds', label: 'of independent storefronts' },
  { value: '$0', label: 'upfront setup fee' },
  { value: '<7 days', label: 'average onboarding' },
  { value: '100%', label: 'Apple Wallet ready' },
];

const FEATURES = [
  {
    img: '/ai/feature-wallet.png',
    title: 'Apple Wallet coupons',
    body:
      'Your first-visit coupon lands directly in your customer’s wallet — no app install, no signup gate, no abandoned funnel.',
  },
  {
    img: '/ai/feature-storefront.png',
    title: 'Branded storefront page',
    body:
      'A landing page in your colors, with your full menu, your phone and your hours. We host it on your subdomain.',
  },
  {
    img: '/ai/feature-ordering.png',
    title: 'Direct online ordering',
    body:
      'Full cart, modifiers, scheduled pickup, and POS hand-off. Direct orders that bypass marketplace fees.',
  },
  {
    img: '/ai/feature-dashboard.png',
    title: 'Real-time owner dashboard',
    body:
      'Track every coupon claim, every redeem and every repeat visit. Push slow-day offers in two taps.',
  },
  {
    img: '/ai/feature-reengagement.png',
    title: 'Re-engagement built in',
    body:
      'Birthday coupons, anniversary nudges and lapsed-customer win-backs trigger from your dashboard automatically.',
  },
  {
    img: '/ai/feature-ownership.png',
    title: 'You own every customer',
    body:
      'Export your customer list any time. We never market to your customers on behalf of a competitor.',
  },
];

// 3 deep-dive sections under the feature grid — each one explains a product
// pillar with its own CSS mockup. Visuals: 'wallet' | 'storefront' | 'dashboard'.
const SHOWCASE = [
  {
    kicker: 'For your customer · Step 1',
    title: 'A first-visit coupon, straight to their wallet.',
    body: 'No app to install. No login wall. Tap the link, add to Apple Wallet, redeem in person. The coupon shows up on the lock screen when your customer pulls into your lot.',
    bullets: [
      'One tap from your landing page → Apple Wallet',
      'Coupon auto-expires; no manual cleanup',
      'You set the offer (% off, free item, BOGO)',
    ],
    visual: 'wallet' as const,
    flip: false,
  },
  {
    kicker: 'For your customer · Step 2',
    title: 'Direct online ordering, on a page that looks like you.',
    body: 'Customers browse your full menu, customize their order, and check out — all on your branded subdomain. No third-party fees, no marketplace promoting your competitors.',
    bullets: [
      'Full menu with modifiers and per-item photos',
      'Scheduled pickup and POS hand-off',
      'Direct payouts, no DoorDash-style fees',
    ],
    visual: 'storefront' as const,
    flip: true,
  },
  {
    kicker: 'For you · The owner side',
    title: 'See every claim, redeem and repeat visit in real time.',
    body: 'A single owner dashboard tracks coupon performance, today’s redemption activity and a live customer list. Push a slow-Tuesday coupon in two taps when you need foot traffic.',
    bullets: [
      'Live claim + redeem feed, second-by-second',
      'Two-tap re-engagement campaigns',
      'Customer list export — your data, always',
    ],
    visual: 'dashboard' as const,
    flip: false,
  },
];

const TESTIMONIALS = [
  {
    quote:
      'We used to spend more on third-party platform fees than on payroll. Hiraccoon gave us a clean storefront we actually control — direct orders, full margins.',
    author: 'Marcus T.',
    role: 'General Manager',
    portrait: '/ai/portrait-1.png',
  },
  {
    quote:
      'Onboarding was honestly easier than setting up a POS. They ported our menu, shipped our first Wallet coupon in five days, and we saw repeat visits move in the first month.',
    author: 'Lisa K.',
    role: 'Owner',
    portrait: '/ai/portrait-2.png',
  },
  {
    quote:
      'I needed something my regulars could actually use — not another app. Apple Wallet was the right move. Older customers redeem coupons just by tapping their phone at the counter.',
    author: 'Daniel R.',
    role: 'Operator',
    portrait: '/ai/portrait-3.png',
  },
  {
    quote:
      'What I like is that the customer is mine. I can email them, text them, run a slow-day push — all from one screen, without paying for someone else’s app to do it.',
    author: 'Priya S.',
    role: 'Owner',
    portrait: '/ai/portrait-4.png',
  },
];

const BELIEFS = [
  {
    icon: '🛡️',
    title: 'Your customers belong to you.',
    body:
      'We never resell your customer list, never market to your customers on behalf of a competing storefront, and never insert someone else’s ad on your page.',
  },
  {
    icon: '💸',
    title: 'You pay only when something works.',
    body:
      'No upfront fee, no monthly subscription, no per-seat cost. Pay only when a customer actually claims a coupon.',
  },
  {
    icon: '🤝',
    title: 'We hand-onboard every partner.',
    body:
      'A real human ports your menu, brands your page and tunes your first offer with you. No "fill out 40 fields and good luck" — we ship the storefront, you approve.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dp-bg text-dp-ink font-sans">
      <HeaderBar />
      <Hero />
      <PartnerWall />
      <StatsStrip />
      <FeatureGrid />
      <ProductShowcase />
      <TestimonialsSection />
      <BeliefsSection />
      <CtaBlock />
      <HomeFooter />
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────
function HeaderBar() {
  return (
    <header className="bg-white/95 backdrop-blur border-b border-dp-divider sticky top-0 z-30">
      <div className="mx-auto max-w-[1280px] px-4 lg:px-8 h-16 sm:h-[68px] flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-white text-lg font-bold"
            style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
          >
            H
          </span>
          <span className="text-[19px] sm:text-[20px] font-bold tracking-tight">Hiraccoon</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-7 text-[14px] text-dp-ink-soft ml-4">
          <a href="#features" className="hover:text-dp-red transition">Features</a>
          <a href="#showcase" className="hover:text-dp-red transition">How it works</a>
          <a href="#stories" className="hover:text-dp-red transition">Stories</a>
          <a href="#beliefs" className="hover:text-dp-red transition">Why us</a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <a
            href={MAILTO_HREF}
            className="inline-flex h-10 sm:h-11 items-center px-4 sm:px-5 rounded-full text-white font-semibold text-[13px] sm:text-[13.5px] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition"
            style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
          >
            Become a partner
          </a>
        </div>
      </div>
    </header>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background:
          'radial-gradient(900px 480px at 18% 25%, #FFD3B6 0%, transparent 60%), radial-gradient(700px 460px at 82% 70%, #FFAA9A 0%, transparent 55%), linear-gradient(135deg, #FFEDE0 0%, #FFF7F0 60%, #FFE6D2 100%)',
      }}
    >
      <div className="relative mx-auto max-w-[1280px] px-5 lg:px-8 pt-12 pb-16 sm:py-20 lg:py-24 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-12 items-center">
        <div className="max-w-[600px] reveal">
          <p
            className="inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-wider text-dp-red bg-white/85 backdrop-blur px-3 py-1 rounded-full ring-1 ring-dp-red/20"
            style={{ animation: 'var(--animate-pulse-soft)' }}
          >
            <span aria-hidden>🍎</span> THE WALLET-FIRST STOREFRONT PLATFORM
          </p>
          <h1 className="mt-5 text-[38px] sm:text-[46px] lg:text-[54px] leading-[1.05] font-extrabold tracking-tight text-dp-ink">
            Own your storefront.
            <br />
            <span className="text-dp-red">Keep your customers.</span>
          </h1>
          <p className="mt-4 sm:mt-5 text-[16px] sm:text-[17px] text-dp-ink-soft max-w-[540px] leading-relaxed">
            A branded landing page, an Apple Wallet first-visit coupon, direct
            online ordering and a real-time owner dashboard — packaged as one
            stack and typically live in under a week.
          </p>

          <div className="mt-7 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
            <a
              href={MAILTO_HREF}
              className="inline-flex items-center justify-center px-6 rounded-xl text-white font-semibold text-[15px] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition shadow-lg shadow-dp-red/20"
              style={{
                background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)',
                height: '52px',
              }}
            >
              ✉️ Become a partner
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-6 rounded-xl bg-white text-dp-ink-soft font-semibold text-[15px] ring-1 ring-dp-divider hover:ring-dp-red hover:-translate-y-0.5 active:translate-y-0 transition"
              style={{ height: '52px' }}
            >
              See what’s included
            </a>
          </div>

          <ul className="mt-7 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2.5 text-[13.5px] text-dp-ink-soft">
            <li>✓ Live in under a week</li>
            <li>✓ No upfront fees</li>
            <li>✓ Apple Wallet first</li>
            <li>✓ You own every customer</li>
          </ul>
        </div>

        <div className="reveal flex justify-center lg:justify-end">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}

function HeroVisual() {
  return (
    <div className="relative w-full max-w-[420px] sm:max-w-[480px] sm:h-[480px] lg:h-[520px]">
      <div
        className="float-pass-anim relative sm:absolute sm:right-0 sm:top-4 w-full sm:w-[280px] lg:w-[320px] h-[180px] sm:h-[180px] lg:h-[200px] rounded-2xl shadow-2xl overflow-hidden text-white mb-[-12px] sm:mb-0 z-10"
        style={{
          background: 'linear-gradient(135deg, #FF503C 0%, #FF6F3C 50%, #FF8800 100%)',
          animation: 'var(--animate-float-pass)',
          willChange: 'transform',
        }}
      >
        <WalletPassContent />
      </div>

      <div
        className="float-store-anim relative sm:absolute sm:left-0 sm:bottom-0 w-full sm:w-[310px] lg:w-[340px] rounded-3xl ring-1 ring-black/10 shadow-2xl bg-white overflow-hidden"
        style={{
          animation: 'var(--animate-float-store)',
          willChange: 'transform',
        }}
      >
        <div className="relative h-[140px] sm:h-[170px] lg:h-[180px] overflow-hidden">
          <Image
            src="/ai/hero-storefront.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 340px, 310px"
            className="object-cover"
            priority
          />
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)',
            }}
          />
          <span className="absolute left-3 top-3 z-10 bg-white/95 text-dp-red text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow tracking-wider">
            HIRACCOON STOREFRONT
          </span>
          <div className="absolute left-4 bottom-3 right-4 z-10 text-white">
            <p className="text-[11px] font-medium opacity-90 uppercase tracking-wider drop-shadow">Your Cuisine</p>
            <p className="text-[18px] sm:text-[19px] font-extrabold drop-shadow-lg">[ Your Storefront ]</p>
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-1.5 text-[12.5px]">
            <span style={{ color: 'var(--color-dp-star)' }} className="leading-none">★★★★★</span>
            <span className="font-semibold text-dp-ink-soft">4.8</span>
            <span className="text-dp-muted">(reviews)</span>
          </div>
          <button
            className="mt-3.5 w-full h-12 rounded-xl text-white font-semibold text-[14px] shadow-lg shadow-dp-red/20 hover:opacity-90 active:translate-y-0.5 transition"
            style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
          >
            Claim your Wallet coupon →
          </button>
        </div>
      </div>
    </div>
  );
}

function WalletPassContent() {
  return (
    <div className="p-5 flex flex-col h-full">
      <div className="flex items-center gap-2">
        <span aria-hidden className="text-[18px]">🍎</span>
        <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Apple Wallet · Coupon</span>
      </div>
      <p className="mt-2.5 text-[12px] font-medium opacity-90">Your Storefront</p>
      <p className="mt-0.5 text-[34px] font-extrabold leading-none">20% OFF</p>
      <p className="text-[11px] opacity-90 mt-1">Your first visit</p>
      <div className="mt-auto flex items-end justify-between">
        <p className="text-[10px] opacity-80 leading-tight">
          Valid in store
          <br />· Expires 30 days
        </p>
        <div className="flex gap-0.5 items-end h-7">
          {[3, 5, 2, 6, 3, 4, 5, 3, 6, 4, 3, 5, 2, 4].map((h, i) => (
            <span key={i} className="w-[2px] bg-white/90" style={{ height: `${h * 4}px` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Partner wall — 3 rows of horizontally-scrolling brand plaques ──────────
function PartnerWall() {
  return (
    <section id="partners" className="bg-white border-y border-dp-divider py-10 sm:py-14 overflow-hidden">
      <div className="text-center max-w-[720px] mx-auto mb-8 sm:mb-10 px-4 reveal">
        <p className="text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase text-dp-muted mb-2">
          Partners on Hiraccoon
        </p>
        <h2 className="text-[22px] sm:text-[26px] lg:text-[30px] font-extrabold tracking-tight leading-tight text-dp-ink">
          Independent storefronts already growing with us.
        </h2>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <MarqueeRow items={PARTNER_ROW_1} duration={70} />
        <MarqueeRow items={PARTNER_ROW_2} duration={90} reverse />
        <MarqueeRow items={PARTNER_ROW_3} duration={60} />
      </div>
    </section>
  );
}

function MarqueeRow({
  items,
  duration,
  reverse = false,
}: {
  items: Partner[];
  duration: number;
  reverse?: boolean;
}) {
  // Double the list so the loop seams are invisible — animation translates by
  // -50% (or back), exactly one original-list width.
  const doubled = [...items, ...items];
  return (
    <div className="relative">
      <div
        className="flex gap-3 sm:gap-4 whitespace-nowrap"
        style={{
          animation: `${reverse ? 'marquee-reverse' : 'marquee'} ${duration}s linear infinite`,
          width: 'max-content',
          willChange: 'transform',
        }}
      >
        {doubled.map((p, i) => (
          <PartnerCard key={`${p.name}-${i}`} partner={p} />
        ))}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-10 sm:w-16"
        style={{ background: 'linear-gradient(90deg, #fff, transparent)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-10 sm:w-16"
        style={{ background: 'linear-gradient(-90deg, #fff, transparent)' }}
      />
    </div>
  );
}

function PartnerCard({ partner: p }: { partner: Partner }) {
  const logo = findLogo(p.slug);
  if (!logo) return null; // logo-only marquee, skip any brand without a real logo
  return (
    <div className="shrink-0 w-[200px] sm:w-[220px] h-[120px] sm:h-[132px] rounded-2xl bg-white ring-1 ring-dp-divider shadow-sm hover:shadow-md hover:-translate-y-0.5 transition relative overflow-hidden">
      <Image
        src={logo}
        alt={p.name}
        fill
        sizes="220px"
        className="object-contain p-5"
      />
    </div>
  );
}

// ─── Stats strip ─────────────────────────────────────────────────────────────
function StatsStrip() {
  return (
    <section className="mt-16 sm:mt-20">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div
          className="reveal rounded-3xl p-7 sm:p-9 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #FF503C 0%, #FF6F3C 50%, #FF8800 100%)' }}
        >
          <div aria-hidden className="hidden sm:block absolute -right-8 -top-8 text-[180px] opacity-10 select-none">📈</div>
          <div className="relative grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 text-center">
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="text-[26px] sm:text-[34px] lg:text-[40px] font-extrabold leading-none tracking-tight">{s.value}</p>
                <p className="mt-2 text-[11px] sm:text-[12.5px] font-medium uppercase tracking-wider opacity-90 leading-tight">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Feature grid ────────────────────────────────────────────────────────────
function FeatureGrid() {
  return (
    <section id="features" className="mx-auto max-w-[1280px] px-5 lg:px-8 mt-16 sm:mt-24">
      <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12 reveal">
        <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">What you get</p>
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold tracking-tight leading-tight">
          The full storefront,
          <br className="sm:hidden" /> not just a coupon tool.
        </h2>
        <p className="mt-3 text-[14.5px] sm:text-[16px] text-dp-muted leading-relaxed">
          The six pieces independent operators usually have to duct-tape together — shipped as one stack.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {FEATURES.map((f) => (
          <div key={f.title} className="reveal">
            <FeatureCard feature={f} />
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureCard({ feature }: { feature: { img: string; title: string; body: string } }) {
  return (
    <div className="group bg-white rounded-2xl ring-1 ring-dp-divider overflow-hidden hover:ring-dp-red/40 hover:shadow-md hover:-translate-y-0.5 transition h-full flex flex-col">
      <div
        className="relative h-[180px] sm:h-[200px] overflow-hidden"
        style={{ background: 'linear-gradient(135deg,#FFE6D2 0%,#FFD3B6 100%)' }}
      >
        <Image
          src={feature.img}
          alt=""
          fill
          sizes="(min-width:1024px) 400px, (min-width:640px) 50vw, 100vw"
          className="object-cover group-hover:scale-105 transition duration-500"
        />
      </div>
      <div className="p-6 sm:p-7 flex-1">
        <p className="text-[17px] sm:text-[18px] font-extrabold text-dp-ink mb-2 leading-snug">{feature.title}</p>
        <p className="text-[14px] sm:text-[14.5px] text-dp-muted leading-relaxed">{feature.body}</p>
      </div>
    </div>
  );
}

// ─── Product showcase ──────────────────────────────────────────────────────
function ProductShowcase() {
  return (
    <section id="showcase" className="bg-white border-y border-dp-divider mt-16 sm:mt-24 py-16 sm:py-20 lg:py-24">
      <div className="text-center max-w-[720px] mx-auto mb-12 sm:mb-16 px-5 reveal">
        <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">How it works</p>
        <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold tracking-tight leading-tight">
          From your menu, to your customer’s wallet,
          <br className="hidden sm:block" /> to your dashboard.
        </h2>
      </div>
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 space-y-16 sm:space-y-20 lg:space-y-24">
        {SHOWCASE.map((s, i) => (
          <ShowcaseRow key={i} item={s} />
        ))}
      </div>
    </section>
  );
}

function ShowcaseRow({
  item,
}: {
  item: typeof SHOWCASE[number];
}) {
  return (
    <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-14 items-center">
      <div className={`${item.flip ? 'lg:order-2' : ''} reveal`}>
        <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">
          {item.kicker}
        </p>
        <h3 className="text-[24px] sm:text-[28px] lg:text-[32px] font-extrabold tracking-tight leading-tight max-w-[460px]">
          {item.title}
        </h3>
        <p className="mt-4 text-[15px] sm:text-[15.5px] text-dp-muted leading-relaxed max-w-[480px]">
          {item.body}
        </p>
        <ul className="mt-5 space-y-3 text-[14.5px] text-dp-ink-soft max-w-[480px]">
          {item.bullets.map((b) => (
            <li key={b} className="flex gap-2.5">
              <span aria-hidden className="text-dp-red mt-0.5 shrink-0">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={`${item.flip ? 'lg:order-1' : ''} reveal flex justify-center lg:justify-${item.flip ? 'start' : 'end'}`}>
        {item.visual === 'wallet' ? <WalletMockup /> : item.visual === 'storefront' ? <StorefrontMockup /> : <DashboardMockup />}
      </div>
    </div>
  );
}

function WalletMockup() {
  return (
    <div className="relative w-full max-w-[360px] sm:max-w-[400px]">
      {/* Phone-ish container */}
      <div className="rounded-[36px] bg-[#1F2024] p-3 shadow-2xl">
        <div className="rounded-[28px] bg-gradient-to-b from-[#FFEDE0] to-[#FFD3B6] p-4 h-[440px] sm:h-[500px] relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] text-dp-ink/70">
            <span>9:41</span>
            <span>Wallet</span>
            <span>···</span>
          </div>
          <p className="mt-3 text-[14px] font-extrabold text-dp-ink">Apple Wallet</p>

          {/* Wallet pass */}
          <div
            className="mt-3 rounded-2xl p-4 text-white shadow-lg"
            style={{ background: 'linear-gradient(135deg, #FF503C 0%, #FF6F3C 50%, #FF8800 100%)' }}
          >
            <div className="flex items-center gap-2">
              <span aria-hidden className="text-[16px]">🍎</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">Coupon</span>
            </div>
            <p className="mt-2 text-[11px] font-medium opacity-90">Your Storefront</p>
            <p className="mt-0.5 text-[28px] font-extrabold leading-none">20% OFF</p>
            <p className="text-[10px] opacity-90 mt-1">Your first visit · expires in 28 days</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-[10px] opacity-80 leading-tight">Show in-store<br />to redeem</p>
              <div className="flex gap-0.5 items-end h-7">
                {[3, 5, 2, 6, 3, 4, 5, 3, 6, 4, 3, 5, 2, 4].map((h, i) => (
                  <span key={i} className="w-[2px] bg-white/90" style={{ height: `${h * 4}px` }} />
                ))}
              </div>
            </div>
          </div>

          {/* Stacked pass shadow under */}
          <div className="mt-2 mx-3 rounded-2xl h-3 bg-white/40 shadow" />
          <div className="mt-1 mx-6 rounded-2xl h-2 bg-white/30" />

          <p className="mt-6 text-center text-[11px] text-dp-ink/60">Tap to redeem at counter</p>
        </div>
      </div>
    </div>
  );
}

function StorefrontMockup() {
  return (
    <div className="w-full max-w-[440px] rounded-3xl ring-1 ring-black/10 shadow-2xl bg-white overflow-hidden">
      <div className="relative h-[120px] overflow-hidden">
        <Image
          src="/ai/mockup-storefront.png"
          alt=""
          fill
          sizes="440px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.65) 100%)',
          }}
        />
        <span className="absolute left-3 top-3 z-10 bg-white/95 text-dp-red text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow tracking-wider">
          HIRACCOON STOREFRONT
        </span>
        <p className="absolute left-4 bottom-3 z-10 text-white text-[18px] font-extrabold drop-shadow-lg">[ Your Storefront ]</p>
      </div>
      <div className="p-4 space-y-2.5">
        {[
          { name: 'House Special #1', sub: 'Chef’s pick', price: '$14.99', img: '/ai/menu-1.png' },
          { name: 'House Special #2', sub: 'Customer favorite', price: '$11.50', img: '/ai/menu-2.png' },
          { name: 'House Special #3', sub: 'Vegan friendly', price: '$9.95', img: '/ai/menu-3.png' },
          { name: 'House Special #4', sub: 'Gluten free', price: '$13.25', img: '/ai/menu-4.png' },
        ].map((it) => (
          <div key={it.name} className="flex items-center gap-3 rounded-xl border border-dp-divider p-2.5 hover:border-dp-red/40 transition">
            <span className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-dp-bg">
              <Image src={it.img} alt="" fill sizes="48px" className="object-cover" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-dp-ink truncate">{it.name}</p>
              <p className="text-[11px] text-dp-muted truncate">{it.sub}</p>
            </div>
            <p className="text-[13px] font-bold text-dp-ink shrink-0">{it.price}</p>
            <button
              className="shrink-0 text-white text-[11px] font-bold px-3 h-8 rounded-lg"
              style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
            >
              + Add
            </button>
          </div>
        ))}
      </div>
      <div className="bg-dp-bg p-3 border-t border-dp-divider">
        <button
          className="w-full h-11 rounded-xl text-white font-bold text-[14px] shadow"
          style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
        >
          Checkout · $39.69
        </button>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="w-full max-w-[460px] rounded-3xl ring-1 ring-black/10 shadow-2xl bg-white overflow-hidden">
      <div className="bg-[#1F2024] text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-6 w-6 items-center justify-center rounded text-white text-[11px] font-bold"
            style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
          >
            H
          </span>
          <span className="text-[12px] font-bold">Hiraccoon · Owner</span>
        </div>
        <span className="text-[11px] opacity-70">Today · live</span>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-3 p-4">
        {[
          { v: '42', l: 'Claims today', c: '#FF503C' },
          { v: '18', l: 'Redeems', c: '#FF8800' },
          { v: '+9', l: 'New customers', c: '#FFB400' },
        ].map((s) => (
          <div key={s.l} className="rounded-xl bg-dp-bg p-3">
            <p className="text-[22px] font-extrabold leading-none" style={{ color: s.c }}>
              {s.v}
            </p>
            <p className="mt-1 text-[10.5px] font-semibold uppercase tracking-wider text-dp-muted leading-tight">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="px-4 pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-dp-muted mb-2">
          Claims · last 7 days
        </p>
        <div className="flex items-end gap-2 h-20">
          {[12, 18, 9, 22, 16, 28, 24].map((v, i) => (
            <div key={i} className="flex-1 rounded-t" style={{ height: `${v * 3}px`, background: 'linear-gradient(180deg,#FF503C 0%,#FF8800 100%)' }} />
          ))}
        </div>
        <div className="flex gap-2 text-[9.5px] text-dp-muted mt-1.5">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <span key={i} className="flex-1 text-center">{d}</span>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      <div className="border-t border-dp-divider px-4 py-3 space-y-1.5 text-[12px] text-dp-ink-soft">
        <p className="text-[10.5px] font-semibold uppercase tracking-wider text-dp-muted mb-1">Recent</p>
        <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-dp-red" /> Customer claimed coupon · 2m ago</p>
        <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-dp-orange" /> Customer redeemed · 8m ago</p>
        <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FFB400' }} /> 12 new visitors this hour</p>
      </div>
    </div>
  );
}

// ─── Testimonials ────────────────────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section id="stories" className="mx-auto max-w-[1280px] px-5 lg:px-8 mt-16 sm:mt-24">
      <div className="text-center max-w-[700px] mx-auto mb-8 sm:mb-12 reveal">
        <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">In their words</p>
        <h2 className="text-[28px] sm:text-[32px] lg:text-[38px] font-extrabold tracking-tight leading-tight">
          What partners say.
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {TESTIMONIALS.map((t, i) => (
          <figure
            key={i}
            className="reveal bg-white rounded-2xl p-6 ring-1 ring-dp-divider hover:ring-dp-red/30 hover:-translate-y-1 hover:shadow-lg transition relative h-full flex flex-col"
          >
            <span aria-hidden className="absolute -top-3 left-6 text-[40px] leading-none text-dp-red/30 font-serif">“</span>
            <blockquote className="text-[14.5px] leading-relaxed text-dp-ink-soft flex-1">
              {t.quote}
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span className="relative inline-flex h-12 w-12 items-center justify-center rounded-full overflow-hidden shrink-0 ring-2 ring-white shadow bg-dp-bg">
                <Image
                  src={t.portrait}
                  alt={t.author}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </span>
              <div>
                <p className="text-[14px] font-bold text-dp-ink leading-tight">{t.author}</p>
                <p className="text-[12px] text-dp-muted">{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ─── Beliefs ─────────────────────────────────────────────────────────────────
function BeliefsSection() {
  return (
    <section id="beliefs" className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div className="text-center max-w-[720px] mx-auto mb-10 sm:mb-12 reveal">
          <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">Why us</p>
          <h2 className="text-[28px] sm:text-[32px] lg:text-[38px] font-extrabold tracking-tight leading-tight">
            Three things we won’t compromise on.
          </h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {BELIEFS.map((b) => (
            <div
              key={b.title}
              className="reveal bg-white rounded-3xl p-7 sm:p-8 ring-1 ring-dp-divider hover:ring-dp-red/30 hover:shadow-md transition h-full"
            >
              <div
                className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-[28px] mb-4"
                style={{ background: 'linear-gradient(135deg,#FFE6D2 0%,#FFD3B6 100%)' }}
              >
                {b.icon}
              </div>
              <p className="text-[19px] sm:text-[20px] font-extrabold text-dp-ink mb-2 leading-snug">{b.title}</p>
              <p className="text-[14.5px] text-dp-muted leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CtaBlock() {
  return (
    <section id="contact" className="mt-16 sm:mt-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8">
        <div
          className="reveal rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden ring-1 ring-dp-red/20 text-center"
          style={{
            background:
              'radial-gradient(800px 400px at 80% 30%, #FFD3B6 0%, transparent 60%), linear-gradient(135deg, #FFF7F0 0%, #FFE6D2 100%)',
          }}
        >
          <div aria-hidden className="hidden sm:block absolute -right-6 -bottom-10 text-[200px] opacity-15 select-none">🚀</div>
          <div aria-hidden className="hidden sm:block absolute -left-4 -top-8 text-[160px] opacity-10 select-none">🍎</div>
          <div className="relative max-w-[560px] mx-auto">
            <p className="text-[12px] font-semibold tracking-wider uppercase text-dp-red mb-2">Ready to join them?</p>
            <h2 className="text-[28px] sm:text-[36px] lg:text-[44px] font-extrabold tracking-tight leading-tight">
              Add your business in
              <br />
              <span className="text-dp-red">under a week.</span>
            </h2>
            <p className="mt-3 sm:mt-4 text-[15px] sm:text-[16.5px] text-dp-ink-soft leading-relaxed">
              Drop us an email — we’ll reply within 24 hours.
            </p>
            <div className="mt-7 sm:mt-8 flex justify-center">
              <a
                href={MAILTO_HREF}
                className="inline-flex items-center justify-center px-7 sm:px-8 rounded-xl text-white font-semibold text-[15px] sm:text-[16px] hover:opacity-90 hover:-translate-y-0.5 active:translate-y-0 transition shadow-xl shadow-dp-red/30"
                style={{
                  background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)',
                  height: '56px',
                }}
              >
                ✉️ Email partners@hiraccoon.com
              </a>
            </div>
            <p className="mt-5 text-[12.5px] text-dp-muted">
              Based in Los Angeles · Serving merchants across the US
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function HomeFooter() {
  return (
    <footer className="bg-[#1F2024] text-white/80 mt-16 sm:mt-24">
      <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-7 sm:gap-8 text-[13.5px]">
        <div>
          <p className="text-white font-bold mb-3 text-[14px]">Product</p>
          <ul className="space-y-2">
            <li><a href="#features" className="hover:text-white">Features</a></li>
            <li><a href="#showcase" className="hover:text-white">How it works</a></li>
            <li><a href="#partners" className="hover:text-white">Partners</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-bold mb-3 text-[14px]">Company</p>
          <ul className="space-y-2">
            <li><a href="#stories" className="hover:text-white">Stories</a></li>
            <li><a href="#beliefs" className="hover:text-white">Why us</a></li>
          </ul>
        </div>
        <div>
          <p className="text-white font-bold mb-3 text-[14px]">Legal</p>
          <ul className="space-y-2">
            <li><a href="/terms-of-service" className="hover:text-white">Terms of service</a></li>
            <li><a href="/privacy-policy" className="hover:text-white">Privacy policy</a></li>
            <li><a href="/refund-policy" className="hover:text-white">Refund policy</a></li>
            <li><a href="/cancellation-policy" className="hover:text-white">Cancellation policy</a></li>
            <li><a href="/dispute-policy" className="hover:text-white">Dispute resolution</a></li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-1">
          <p className="text-white font-bold mb-3 text-[14px]">Talk to us</p>
          <p className="text-[12.5px] text-white/60 mb-3">Partners — we reply within 24 hours.</p>
          <a
            href={MAILTO_HREF}
            className="inline-flex items-center px-4 h-10 rounded-lg bg-dp-red text-white text-[13px] font-semibold hover:bg-dp-red-dark transition"
          >
            partners@hiraccoon.com
          </a>
          <div className="mt-5 text-[12px] text-white/60 leading-relaxed">
            <p className="text-white/80 font-semibold mb-1">Customer support</p>
            <p>
              <a href="mailto:support@hiraccoon.com" className="hover:text-white">support@hiraccoon.com</a>
            </p>
            <p>
              <a href="tel:2173186661" className="hover:text-white">217-318-6661</a>
            </p>
            <p className="mt-1">14639 Booth Memorial Avenue, Flushing, NY 11355</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-8 py-5 text-[12px] text-white/50 flex flex-wrap items-center justify-between gap-3">
          <span>© 2026 Hiraccoon · All rights reserved. Hiraccoon is operated by A-MANI Holdings Management Inc.</span>
          <div className="flex items-center gap-2">
            <span
              className="inline-flex h-6 w-6 items-center justify-center rounded text-white text-[11px] font-bold"
              style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
            >
              H
            </span>
            <span>Built for local merchants.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
