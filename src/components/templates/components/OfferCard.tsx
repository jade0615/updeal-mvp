'use client';

import React from 'react';
import { Flame, Users, ShieldCheck } from 'lucide-react';
import type { MerchantContent } from '@/types/merchant';

interface OfferCardProps {
    offer: NonNullable<MerchantContent['offer']>;
    claimedCount: number;
    claimedAvatars: string[];
    merchantName: string;
}

export default function OfferCard({
    offer,
    claimedCount,
    claimedAvatars,
}: OfferCardProps) {
    const progress = Math.min((claimedCount / (offer.totalLimit || 100)) * 100, 100) || 70;

    return (
        <div className="relative w-full transition-all duration-500 hover:-translate-y-2 group/card">
            {/* Pure Glass Card Style */}
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/20 rounded-[32px] p-6 shadow-2xl overflow-hidden group">
                <div className="noise-overlay opacity-10 pointer-events-none" />

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 p-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-black tracking-widest text-white uppercase backdrop-blur-md">
                        <Flame className="w-3 h-3 text-orange-500 fill-current" />
                        Exclusive
                    </div>
                </div>

                <div className="relative z-10 space-y-6">
                    {/* Offer Title */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-orange-500" />
                            <span className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">Verified Member Deal</span>
                        </div>
                        <h3 className="text-white text-[42px] font-black leading-tight tracking-tighter">
                            {offer.value}
                            {offer.unit && offer.unit !== 'OFF' && <span className="text-orange-500 ml-1">{offer.unit}</span>}
                        </h3>
                        <p className="text-white/60 text-sm font-medium pr-10">
                            {offer.description}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-3">
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-orange-600 to-red-500 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(255,87,34,0.3)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-black tracking-[0.2em] text-white/40 uppercase">
                            <div className="flex items-center gap-1.5">
                                <Users className="w-3.5 h-3.5" />
                                {claimedCount}+ REDEEMED
                            </div>
                            <div className="flex items-center -space-x-2">
                                {claimedAvatars.map((a, i) => (
                                    <img key={i} src={a} alt="user" className="w-5 h-5 rounded-full border border-black/40 object-cover" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            </div>
        </div>
    );
}
