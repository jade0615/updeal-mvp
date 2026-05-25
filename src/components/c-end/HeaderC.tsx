/**
 * Consumer-facing header used on `/restaurants/` and `/restaurants/<slug>/`.
 *
 * Deliberately separate from the B2B partner-showcase header at `/`
 * (which speaks to restaurant owners). This one speaks to diners.
 */
import Link from 'next/link';

export default function HeaderC() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-dp-divider">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-dp-ink hover:text-dp-red transition"
        >
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-white text-[13px] font-bold"
            style={{ background: 'linear-gradient(135deg,#FF503C 0%,#FF8800 100%)' }}
          >
            H
          </span>
          <span className="font-bold text-[15px]">Hiraccoon</span>
        </Link>

        <nav className="flex items-center gap-5 text-[13.5px]">
          <Link
            href="/restaurants"
            className="text-dp-ink-soft hover:text-dp-ink transition font-medium"
          >
            Restaurants
          </Link>
          <a
            href="mailto:support@hiraccoon.com"
            className="text-dp-ink-soft hover:text-dp-ink transition font-medium"
          >
            Help
          </a>
        </nav>
      </div>
    </header>
  );
}
