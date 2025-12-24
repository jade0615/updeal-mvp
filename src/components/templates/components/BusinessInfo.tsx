import { Star, ShieldCheck, Clock, MapPin } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';

interface BusinessInfoProps {
    logoUrl?: string;
    name: string;
    type: string;
    priceRange: string;
    rating: number;
    reviewCount: string;
    address: MerchantContent['address'];
    establishedYear: number;
}

export default function BusinessInfo({
    name,
    rating,
    reviewCount,
    address,
    establishedYear,
}: BusinessInfoProps) {
    return (
        <div className="relative pt-4 pb-8">
            {/* Business Text Content */}
            <div className="relative z-10 max-w-[60%]">
                <h1 className="text-white text-[38px] font-bold leading-[1.1] mb-4 tracking-tight">
                    {name.split(' ').map((word, i) => i === 2 ? <div key={i}><br />{word}</div> : word + ' ')}
                </h1>

                <div className="flex items-center gap-2 mb-5">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold text-sm shadow-lg shadow-orange-500/20">
                        <Star className="h-4 w-4 fill-current" />
                        {rating}
                    </div>
                    <span className="text-white/60 text-sm font-medium">({reviewCount} Reviews)</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1D5A4A] text-[#5DD9A9] text-[11px] font-bold tracking-wide border border-white/5 uppercase">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Est. {establishedYear}
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2A4A42] text-white text-[11px] font-bold tracking-wide border border-white/10 uppercase">
                        <Clock className="h-3.5 w-3.5" />
                        OPEN NOW
                    </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border-1.5 border-[#D4915A] text-[#D4915A] text-[11px] font-bold tracking-wide uppercase">
                    <MapPin className="h-3.5 w-3.5" />
                    {address.area || 'LOCAL'}
                </div>
            </div>


        </div>
    );
}
