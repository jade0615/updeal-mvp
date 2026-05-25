import Link from 'next/link';

interface LandingFooterProps {
    hideBranding?: boolean;
    /**
     * Slug used to be forwarded to /terms-of-service?slug=... and
     * /privacy-policy?slug=... so the legal pages could pull in
     * merchant-specific content. Under the 2026-05-25 platform contract the
     * legal pages are platform-level and the slug is no longer used, but
     * we keep the prop so existing call sites don't need to change.
     */
    slug?: string;
}

// Platform-level legal pages (operated by A-MANI Holdings Management Inc.).
const LEGAL_LINKS = [
    { href: '/terms-of-service', label: 'Terms of Service' },
    { href: '/privacy-policy', label: 'Privacy Policy' },
    { href: '/refund-policy', label: 'Refund Policy' },
    { href: '/cancellation-policy', label: 'Cancellation Policy' },
    { href: '/dispute-policy', label: 'Dispute Resolution' },
];

export default function LandingFooter({ hideBranding }: LandingFooterProps) {
    if (hideBranding) return null;

    return (
        <footer className="mt-12 py-8 text-center text-xs text-gray-400">
            <p>© {new Date().getFullYear()} UpDeal. All rights reserved. • Powered by hiraccoon.com</p>
            <p className="mt-1">Hiraccoon is operated by A-MANI Holdings Management Inc.</p>
            <nav
                aria-label="Legal pages"
                className="mt-3 flex justify-center flex-wrap gap-x-4 gap-y-1"
            >
                {LEGAL_LINKS.map((item, i) => (
                    <span key={item.href} className="flex items-center gap-3">
                        <Link href={item.href} className="hover:text-gray-600 underline">
                            {item.label}
                        </Link>
                        {i < LEGAL_LINKS.length - 1 && <span aria-hidden>|</span>}
                    </span>
                ))}
            </nav>
        </footer>
    );
}
