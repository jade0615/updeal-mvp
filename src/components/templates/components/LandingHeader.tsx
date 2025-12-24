import { ArrowLeft, Heart, Share2 } from 'lucide-react';

export default function LandingHeader() {
    return (
        <header className="absolute top-0 left-0 right-0 z-50 p-4">
            <nav className="mx-auto max-w-7xl flex items-center justify-between">
                <button className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex gap-3">
                    <button className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                        <Heart className="h-5 w-5" />
                    </button>
                    <button className="h-11 w-11 flex items-center justify-center rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-white transition-all hover:bg-white/20 hover:scale-105 active:scale-95">
                        <Share2 className="h-5 w-5" />
                    </button>
                </div>
            </nav>
        </header>
    );
}
