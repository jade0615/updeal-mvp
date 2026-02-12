import { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Share2, Check } from 'lucide-react';

export default function LandingHeader() {
    const [isLoved, setIsLoved] = useState(false);
    const [isShared, setIsShared] = useState(false);

    useEffect(() => {
        // Load love state from local storage based on current URL
        const key = `updeal_love_${window.location.pathname}`;
        setIsLoved(localStorage.getItem(key) === 'true');
    }, []);

    const handleLove = () => {
        const key = `updeal_love_${window.location.pathname}`;
        const newState = !isLoved;
        setIsLoved(newState);
        localStorage.setItem(key, String(newState));

        // Track event (Simulated for MVP)
        if (newState && (window as any).gtag) {
            (window as any).gtag('event', 'love_merchant', {
                'merchant_path': window.location.pathname
            });
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: document.title,
                    url: window.location.href,
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            setIsShared(true);
            setTimeout(() => setIsShared(false), 2000);
        }
    };

    return (
        <header className="absolute top-0 left-0 right-0 z-50 p-4">
            <nav className="mx-auto max-w-7xl flex items-center justify-between">
                <a
                    href="/"
                    aria-label="Back"
                    className="h-11 w-11 flex flex-col items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="text-[8px] font-bold uppercase leading-none mt-0.5 tracking-tighter">Back</span>
                </a>
                <div className="flex gap-3">
                    <button
                        onClick={handleLove}
                        className={`h-11 w-11 flex items-center justify-center rounded-full border backdrop-blur-md transition-all hover:scale-105 active:scale-95 ${isLoved ? 'bg-red-500/20 border-red-500/50 text-red-500' : 'bg-white/10 border-white/15 text-white hover:bg-white/20'}`}
                    >
                        <Heart className={`h-5 w-5 ${isLoved ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleShare}
                        className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95 group"
                    >
                        {isShared ? <Check className="h-5 w-5 text-orange-400" /> : <Share2 className="h-5 w-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                </div>
            </nav>
        </header>
    );
}
