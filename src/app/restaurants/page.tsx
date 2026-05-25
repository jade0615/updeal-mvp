/**
 * `/restaurants/` — C-end aggregator landing.
 *
 * This is the consumer-facing entry into the Hiraccoon restaurant directory.
 * The B2B partner-showcase at `/` is intentionally untouched; this lives
 * alongside it.
 *
 * Structure: HeaderC → Hero → RestaurantGrid (3 cards) → FooterC.
 *
 * SEO target: generic discovery queries like "order from local restaurants",
 * "independent restaurant ordering". Each card links to the detail page
 * `/restaurants/<urlSlug>/` (further down the SEO funnel) and the inline
 * "Order Now" button short-circuits straight to the merchant subdomain
 * for returning customers who already know the brand.
 */
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { RESTAURANTS, urlSlugFor, type Restaurant } from '@/data/restaurants';
import HeaderC from '@/components/c-end/HeaderC';
import FooterC from '@/components/c-end/FooterC';

export const metadata: Metadata = {
  title: 'Order from local restaurants — Hiraccoon',
  description:
    'Hand-picked independent restaurants you can order from directly. Skip the third-party fees, support the kitchen.',
  openGraph: {
    title: 'Order from local restaurants — Hiraccoon',
    description:
      'Hand-picked independent restaurants you can order from directly. Skip the third-party fees, support the kitchen.',
    type: 'website',
    url: 'https://hiraccoon.com/restaurants',
    images: [{ url: 'https://hiraccoon.com/ai/hero-storefront.png' }],
  },
};

export default function RestaurantsLandingPage() {
  return (
    <div className="min-h-screen bg-dp-bg text-dp-ink">
      <HeaderC />
      <Hero />
      <RestaurantGrid restaurants={RESTAURANTS} />
      <JsonLd />
      <FooterC />
    </div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/ai/hero-storefront.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/30 to-dp-bg" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <p className="text-white/85 text-[12.5px] uppercase tracking-[0.2em] font-bold mb-4">
          Hiraccoon · local restaurants
        </p>
        <h1 className="text-white text-[34px] sm:text-[44px] lg:text-[52px] font-black leading-[1.1] tracking-tight max-w-3xl">
          Order from local restaurants you'll actually come back to.
        </h1>
        <p className="mt-5 text-white/85 text-[15.5px] sm:text-[17px] leading-relaxed max-w-2xl">
          Independent kitchens, hand-picked. Order pickup directly — no DoorDash markup,
          no Grubhub fee, no third-party fees coming out of the kitchen.
        </p>
      </div>
    </section>
  );
}

// ─── Grid ────────────────────────────────────────────────────────────────────
function RestaurantGrid({ restaurants }: { restaurants: Restaurant[] }) {
  return (
    <section className="mx-auto max-w-6xl px-5 lg:px-8 py-12 sm:py-16">
      <h2 className="text-[20px] sm:text-[22px] font-bold text-dp-ink mb-1">
        Restaurants on Hiraccoon
      </h2>
      <p className="text-[13.5px] text-dp-muted mb-7">
        Pickup-ready, currently accepting orders.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {restaurants.map((r) => (
          <RestaurantCard key={r.slug} restaurant={r} />
        ))}
      </div>
    </section>
  );
}

function RestaurantCard({ restaurant: r }: { restaurant: Restaurant }) {
  const detailHref = `/restaurants/${urlSlugFor(r)}/`;
  return (
    <article className="group bg-dp-surface rounded-2xl ring-1 ring-dp-divider overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition flex flex-col">
      {/* Image — entire image clickable into detail page */}
      <Link href={detailHref} className="relative aspect-[4/3] bg-dp-divider block">
        <Image
          src={r.heroImage}
          alt={`${r.name} — ${r.cuisine}`}
          fill
          sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
          className="object-cover group-hover:scale-[1.02] transition-transform"
        />
      </Link>

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <Link href={detailHref} className="block">
            <h3 className="text-[17px] font-bold text-dp-ink leading-tight hover:text-dp-red transition">
              {r.name}
            </h3>
          </Link>
          <p className="text-[12.5px] text-dp-muted mt-1">
            {r.city}, {r.state} · {r.cuisine}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-auto pt-2">
          <Link
            href={detailHref}
            className="text-[13px] font-semibold text-dp-ink hover:text-dp-red transition"
          >
            View details →
          </Link>
          <span className="text-dp-divider">·</span>
          <a
            href={r.orderUrl}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center px-3 h-8 rounded-md bg-dp-red text-white text-[13px] font-semibold hover:bg-dp-red-dark transition"
          >
            Order Now
          </a>
        </div>
      </div>
    </article>
  );
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────
function JsonLd() {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: RESTAURANTS.map((r, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: `https://hiraccoon.com/restaurants/${urlSlugFor(r)}/`,
      name: r.name,
    })),
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Hiraccoon',
    url: 'https://hiraccoon.com',
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
