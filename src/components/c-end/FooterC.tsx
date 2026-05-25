/**
 * Consumer-facing footer for `/restaurants/` pages.
 *
 * Carries the 5 legal-page nav (mirrors `LegalPage` footer), the A-MANI
 * operator line, the support contact, and a low-key B2B link back to `/`
 * (the existing partner-showcase landing page).
 */
import Link from 'next/link';

const LEGAL_LINKS = [
  { href: '/terms-of-service', label: 'Terms' },
  { href: '/privacy-policy', label: 'Privacy' },
  { href: '/refund-policy', label: 'Refunds' },
  { href: '/cancellation-policy', label: 'Cancellation' },
  { href: '/dispute-policy', label: 'Disputes' },
];

export default function FooterC() {
  return (
    <footer className="mt-16 sm:mt-24 bg-[#1F2024] text-white/80">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 py-10 sm:py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-[13.5px]">
        {/* Brand + operator line */}
        <div>
          <div className="inline-flex items-center gap-2 text-white mb-3">
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded text-white text-[12px] font-bold"
              style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
            >
              H
            </span>
            <span className="font-bold text-[15px]">Hiraccoon</span>
          </div>
          <p className="text-white/60 text-[12.5px] leading-relaxed">
            Hiraccoon is operated by A-MANI Holdings Management Inc.
          </p>
          <p className="text-white/50 text-[12px] mt-2 leading-relaxed">
            14639 Booth Memorial Avenue<br />
            Flushing, NY 11355
          </p>
        </div>

        {/* Support */}
        <div>
          <p className="text-white font-bold mb-3 text-[14px]">Customer support</p>
          <p className="text-[12.5px] text-white/60 mb-3">
            We reply within 24 hours.
          </p>
          <p className="text-[13px] text-white/80">
            <a href="mailto:support@hiraccoon.com" className="hover:text-white">
              support@hiraccoon.com
            </a>
          </p>
          <p className="text-[13px] text-white/80">
            <a href="tel:2173186661" className="hover:text-white">
              217-318-6661
            </a>
          </p>
        </div>

        {/* Legal + B2B link */}
        <div>
          <p className="text-white font-bold mb-3 text-[14px]">Legal</p>
          <nav aria-label="Legal pages" className="flex flex-wrap gap-x-4 gap-y-1.5 mb-5">
            {LEGAL_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-white/60 hover:text-white text-[12.5px]"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <p className="text-[12px] text-white/40">
            Are you a restaurant?{' '}
            <Link href="/" className="text-white/70 hover:text-white underline underline-offset-2">
              Learn how to list on Hiraccoon →
            </Link>
          </p>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 lg:px-8 py-5 text-[12px] text-white/50">
          © {new Date().getFullYear()} A-MANI Holdings Management Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
