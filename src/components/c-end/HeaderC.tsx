/**
 * Consumer-facing header used on `/restaurants/` and `/restaurants/<slug>/`.
 *
 * Deliberately separate from the B2B partner-showcase header at `/`
 * (which speaks to restaurant owners). This one speaks to diners.
 */
import Image from 'next/image';
import Link from 'next/link';

export default function HeaderC() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-dp-divider">
      <div className="mx-auto max-w-6xl px-5 lg:px-8 h-14 flex items-center justify-between">
        <Link
          href="/restaurants"
          className="inline-flex items-center gap-2 text-dp-ink hover:text-dp-red transition"
        >
          <Image
            src="/raccoon-logo-transparent.png"
            alt="Hiraccoon"
            width={36}
            height={36}
            priority
            className="h-9 w-9 object-contain"
          />
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
