/**
 * `/restaurants/[urlSlug]/` — single-restaurant detail page.
 *
 * Mid-detail SEO landing for individual venues. Targets long-tail queries
 * like "chinese buffet wood river il". Renders restaurant blurb + hours +
 * address + photo gallery + a big Order Now CTA that sends users to the
 * merchant's subdomain ordering site (bestbuffet.hiraccoon.com etc.).
 *
 * Statically pre-rendered at build time via `generateStaticParams`.
 *
 * Deliberately does NOT include the full menu — that lives on the
 * subdomain. Keeping content distinct from the subdomain ordering page
 * avoids duplicate-content SEO collisions.
 */
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  RESTAURANTS,
  urlSlugFor,
  findRestaurantByUrlSlug,
  type Restaurant,
} from '@/data/restaurants';
import HeaderC from '@/components/c-end/HeaderC';
import FooterC from '@/components/c-end/FooterC';

type RouteParams = { urlSlug: string };

// Pre-render all 3 restaurant detail URLs at build time.
export function generateStaticParams(): RouteParams[] {
  return RESTAURANTS.map((r) => ({ urlSlug: urlSlugFor(r) }));
}

export async function generateMetadata(
  { params }: { params: Promise<RouteParams> },
): Promise<Metadata> {
  const { urlSlug } = await params;
  const r = findRestaurantByUrlSlug(urlSlug);
  if (!r) return {};

  const title = r.metaTitle ?? `${r.name} — Hiraccoon`;
  const description = r.metaDescription ?? r.blurb[0];
  const canonical = `https://hiraccoon.com/restaurants/${urlSlugFor(r)}/`;
  const ogImage = `https://hiraccoon.com${r.heroImage}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function RestaurantDetailPage(
  { params }: { params: Promise<RouteParams> },
) {
  const { urlSlug } = await params;
  const r = findRestaurantByUrlSlug(urlSlug);
  if (!r) notFound();

  return (
    <div className="min-h-screen bg-dp-bg text-dp-ink">
      <HeaderC />
      <Breadcrumb restaurant={r} />
      <RestaurantHero restaurant={r} />
      <RestaurantIntro restaurant={r} />
      <RestaurantFacts restaurant={r} />
      <RestaurantGallery restaurant={r} />
      <OrderCTA restaurant={r} />
      <JsonLd restaurant={r} />
      <FooterC />
    </div>
  );
}

// ─── Breadcrumb ──────────────────────────────────────────────────────────────
function Breadcrumb({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-5xl px-5 lg:px-8 pt-5 text-[12.5px] text-dp-muted"
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/restaurants" className="hover:text-dp-ink transition">
            Restaurants
          </Link>
        </li>
        <li aria-hidden>›</li>
        <li className="text-dp-ink-soft truncate">{r.name}</li>
      </ol>
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function RestaurantHero({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <section className="mx-auto max-w-5xl px-5 lg:px-8 pt-5">
      <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden ring-1 ring-dp-divider">
        <Image
          src={r.heroImage}
          alt={`${r.name} — ${r.cuisine}`}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <h1 className="text-white text-[26px] sm:text-[36px] lg:text-[42px] font-black leading-tight tracking-tight">
            {r.name}
          </h1>
          <p className="text-white/85 text-[14px] sm:text-[15.5px] mt-2 font-medium">
            {r.city}, {r.state} · {r.cuisine}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Intro ───────────────────────────────────────────────────────────────────
function RestaurantIntro({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <section className="mx-auto max-w-3xl px-5 lg:px-8 mt-10">
      {r.blurb.map((paragraph, i) => (
        <p
          key={i}
          className="text-[15.5px] sm:text-[16.5px] leading-relaxed text-dp-ink-soft mb-4 last:mb-0"
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}

// ─── Facts (hours + address + phone) ─────────────────────────────────────────
function RestaurantFacts({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <section className="mx-auto max-w-3xl px-5 lg:px-8 mt-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Hours */}
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold text-dp-muted mb-3">
            Hours
          </h2>
          <ul className="space-y-1.5">
            {r.hours.map((line, i) => (
              <li key={i} className="text-[14.5px] text-dp-ink-soft">
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* Address + phone */}
        <div>
          <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold text-dp-muted mb-3">
            Address &amp; phone
          </h2>
          <p className="text-[14.5px] text-dp-ink-soft leading-relaxed">
            {r.address.full}
          </p>
          <p className="text-[14.5px] mt-2">
            <a
              href={`tel:${r.phone.replace(/[^0-9+]/g, '')}`}
              className="text-dp-red hover:underline"
            >
              {r.phone}
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
function RestaurantGallery({ restaurant: r }: { restaurant: Restaurant }) {
  if (r.galleryImages.length === 0) return null;
  return (
    <section className="mx-auto max-w-5xl px-5 lg:px-8 mt-12">
      <h2 className="text-[12px] uppercase tracking-[0.15em] font-bold text-dp-muted mb-4">
        From the kitchen
      </h2>
      <div
        className={`grid gap-3 sm:gap-4 ${
          r.galleryImages.length >= 3
            ? 'grid-cols-2 sm:grid-cols-3'
            : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {r.galleryImages.map((src, i) => (
          <div
            key={src}
            className="relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-dp-divider bg-dp-divider"
          >
            <Image
              src={src}
              alt={`${r.name} — dish ${i + 1}`}
              fill
              sizes="(min-width: 640px) 320px, 100vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Order CTA ───────────────────────────────────────────────────────────────
function OrderCTA({ restaurant: r }: { restaurant: Restaurant }) {
  return (
    <section className="mx-auto max-w-3xl px-5 lg:px-8 mt-14">
      <div className="rounded-3xl bg-white ring-1 ring-dp-divider p-7 sm:p-9 shadow-clean text-center">
        <p className="text-[12px] uppercase tracking-[0.18em] font-bold text-dp-muted mb-3">
          Ready to order
        </p>
        <h2 className="text-[22px] sm:text-[26px] font-black text-dp-ink leading-tight mb-5 max-w-md mx-auto">
          Order pickup directly from {r.name}.
        </h2>

        <a
          href={r.orderUrl}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center px-6 h-12 rounded-xl bg-dp-red text-white text-[15.5px] font-bold hover:bg-dp-red-dark transition shadow-float"
        >
          Order Now →
        </a>

        <p className="mt-5 text-[13px] text-dp-muted">
          New here?{' '}
          <Link
            href={r.claimCouponPath}
            className="text-dp-ink hover:text-dp-red underline underline-offset-2"
          >
            Get a first-visit coupon
          </Link>
          .
        </p>
      </div>
    </section>
  );
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────
function JsonLd({ restaurant: r }: { restaurant: Restaurant }) {
  const url = `https://hiraccoon.com/restaurants/${urlSlugFor(r)}/`;

  // Restaurant schema. NOTE: intentionally omits aggregateRating to avoid
  // Google flagging spammy structured data (we don't have verified review
  // counts), and omits openingHoursSpecification (our hours are stored as
  // human strings, not parseable).
  const restaurantSchema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.name,
    image: [`https://hiraccoon.com${r.heroImage}`],
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.address.street,
      addressLocality: r.city,
      addressRegion: r.state,
      addressCountry: 'US',
    },
    telephone: r.phone,
    servesCuisine: r.cuisine,
    url,
    // Outbound ordering URL (e.g. https://bestbuffet.hiraccoon.com)
    potentialAction: {
      '@type': 'OrderAction',
      target: r.orderUrl,
    },
  };

  // Breadcrumb (note position 3 has no `item` — Google convention for
  // current-page leaf).
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Restaurants',
        item: 'https://hiraccoon.com/restaurants/',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: r.name,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchema) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
    </>
  );
}
