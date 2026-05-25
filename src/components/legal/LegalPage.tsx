/**
 * Shared layout for the five platform-level legal pages on hiraccoon.com:
 *   /terms-of-service /privacy-policy /refund-policy /cancellation-policy
 *   /dispute-policy
 *
 * Per the contract finalized 2026-05-25 (see business spec PDF):
 *   - 5% platform commission is charged to the Merchant (Direct Charge).
 *     It is NOT shown to the consumer anywhere, so consumer-facing terms
 *     don't mention it — that's covered in the Merchant Agreement instead.
 *   - The Merchant is the seller of record for all food orders.
 *   - Hiraccoon (A-MANI Holdings Management Inc.) operates the platform
 *     and provides ordering technology; Stripe processes payments.
 *
 * Every legal page must show:
 *   - title + effective date
 *   - body
 *   - 5-link legal nav (Terms / Privacy / Refund / Cancellation / Dispute)
 *   - "Hiraccoon is operated by A-MANI Holdings Management Inc." line
 *   - support@hiraccoon.com / 217-318-6661 / 14639 Booth Memorial Avenue,
 *     Flushing, NY 11355
 *
 * NOTE: Effective date is wired through `LEGAL_EFFECTIVE_DATE` below. Update
 *       it to the real launch day before going live (PDF checklist item 4).
 */
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const LEGAL_EFFECTIVE_DATE = 'May 25, 2026';

export const LEGAL_NAV: { href: string; label: string }[] = [
  { href: '/terms-of-service', label: 'Terms of Service' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/refund-policy', label: 'Refund Policy' },
  { href: '/cancellation-policy', label: 'Cancellation Policy' },
  { href: '/dispute-policy', label: 'Dispute Resolution' },
];

export const HIRACCOON_OPERATOR_LINE =
  'Hiraccoon is operated by A-MANI Holdings Management Inc.';

export const SUPPORT_EMAIL = 'support@hiraccoon.com';
export const SUPPORT_PHONE = '217-318-6661';
export const SUPPORT_ADDRESS =
  '14639 Booth Memorial Avenue, Flushing, NY 11355';

interface LegalPageProps {
  title: string;
  /** Override the shared default effective date if a specific page needs to. */
  effectiveDate?: string;
  /** Path of the current page, used to highlight the active legal-nav link. */
  currentPath: string;
  children: ReactNode;
}

export default function LegalPage({
  title,
  effectiveDate = LEGAL_EFFECTIVE_DATE,
  currentPath,
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-dp-bg text-dp-ink">
      {/* Top bar — minimal, just a back-to-home affordance */}
      <header className="border-b border-dp-divider bg-dp-surface">
        <div className="mx-auto max-w-3xl px-5 lg:px-8 h-14 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-semibold text-dp-ink hover:text-dp-red transition"
          >
            <Image
              src="/raccoon-logo-transparent.png"
              alt="Hiraccoon"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
            />
            <span>Hiraccoon</span>
          </Link>
          <Link
            href="/"
            className="text-[12.5px] text-dp-muted hover:text-dp-ink transition"
          >
            ← Back to home
          </Link>
        </div>
      </header>

      {/* Title + effective date */}
      <main className="mx-auto max-w-3xl px-5 lg:px-8 py-10 sm:py-14">
        <h1 className="text-[28px] sm:text-[32px] font-black tracking-tight text-dp-ink">
          {title}
        </h1>
        <p className="mt-2 text-[12px] uppercase tracking-[0.18em] font-bold text-dp-muted">
          Effective Date: {effectiveDate}
        </p>

        {/* Body */}
        <article className="mt-8 text-[14.5px] leading-[1.75] text-dp-ink-soft legal-body">
          {children}
        </article>

        {/* Legal nav (5 links + operator line + contact) */}
        <LegalFooter currentPath={currentPath} />
      </main>
    </div>
  );
}

function LegalFooter({ currentPath }: { currentPath: string }) {
  return (
    <footer className="mt-14 pt-8 border-t border-dp-divider">
      <nav
        aria-label="Legal pages"
        className="flex flex-wrap gap-x-5 gap-y-2 text-[12.5px] font-medium"
      >
        {LEGAL_NAV.map((item) => {
          const active = item.href === currentPath;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'text-dp-red underline underline-offset-4 decoration-dp-red/40'
                  : 'text-dp-muted hover:text-dp-ink transition'
              }
              aria-current={active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <p className="mt-6 text-[12.5px] text-dp-ink-soft">
        {HIRACCOON_OPERATOR_LINE}
      </p>
      <p className="mt-1 text-[12.5px] text-dp-muted">
        {SUPPORT_ADDRESS}
      </p>
      <p className="mt-1 text-[12.5px] text-dp-muted">
        Email:{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="text-dp-red hover:underline"
        >
          {SUPPORT_EMAIL}
        </a>{' '}
        · Phone:{' '}
        <a
          href={`tel:${SUPPORT_PHONE.replace(/[^0-9+]/g, '')}`}
          className="text-dp-red hover:underline"
        >
          {SUPPORT_PHONE}
        </a>
      </p>

      <p className="mt-6 text-[11px] text-dp-muted/80">
        © {new Date().getFullYear()} A-MANI Holdings Management Inc. All rights reserved.
      </p>
    </footer>
  );
}

/**
 * Helper components for consistent in-body typography. Used by each of the
 * 5 legal pages to avoid copy-pasting class names everywhere.
 */
export function LegalSection({
  number,
  title,
  children,
}: {
  number?: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-8 first:mt-0">
      <h2 className="text-[16px] sm:text-[17px] font-bold text-dp-ink mb-2">
        {number != null ? `${number}. ` : ''}
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

export function LegalIntro({ children }: { children: ReactNode }) {
  return (
    <p className="text-[15px] text-dp-ink-soft leading-[1.75]">{children}</p>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc pl-5 space-y-2 text-dp-ink-soft">
      {items.map((it, i) => (
        <li key={i}>{it}</li>
      ))}
    </ul>
  );
}
