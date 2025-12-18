import Link from 'next/link';
import { Home } from 'lucide-react';

export default function LandingHeader() {
    return (
        <header className="absolute top-0 left-0 right-0 z-10 p-4">
            <nav className="mx-auto max-w-7xl flex items-center justify-between">
                <Link href="/" className="flex items-center justify-center rounded-full bg-white/80 p-2 backdrop-blur-sm shadow-sm hover:bg-white transition-colors">
                    <Home className="h-5 w-5 text-gray-700" />
                    <span className="sr-only">Home</span>
                </Link>
                {/* Can add more nav items or Merchant Login link here */}
            </nav>
        </header>
    );
}
