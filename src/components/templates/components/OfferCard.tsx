import { Ticket, Users } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';

interface OfferCardProps {
    offer: MerchantContent['offer'];
    claimedCount: number;
    claimedAvatars: string[];
}

export default function OfferCard({
    offer,
    claimedCount,
    claimedAvatars,
}: OfferCardProps) {
    return (
        <div className="mb-8 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-100">
            <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 to-purple-700 p-6 text-white text-center">
                {/* Background Patterns could go here */}

                <div className="mb-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                    {offer.type} Offer
                </div>

                <div className="mb-1 flex items-baseline justify-center font-bold">
                    <span className="text-5xl md:text-6xl">{offer.value}</span>
                    <span className="ml-2 text-2xl md:text-3xl opacity-90">{offer.unit}</span>
                </div>

                <p className="mb-4 text-sm font-medium opacity-90 text-indigo-100">
                    {offer.description}
                </p>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-indigo-200">
                    <Ticket className="h-4 w-4" />
                    <span>Limit {offer.totalLimit} coupons</span>
                </div>
            </div>

            {/* Social Proof */}
            <div className="bg-gray-50 px-6 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center -space-x-2">
                        {claimedAvatars.map((avatar, i) => (
                            <img
                                key={i}
                                src={avatar}
                                alt="User"
                                className="h-8 w-8 rounded-full border-2 border-white ring-1 ring-gray-200"
                            />
                        ))}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-xs font-bold text-gray-600 ring-1 ring-gray-200">
                            +{claimedCount > 3 ? claimedCount - 3 : 0}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                        <Users className="h-4 w-4" />
                        <span className="font-semibold text-gray-900">{claimedCount}</span>
                        <span>people claimed this week</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
