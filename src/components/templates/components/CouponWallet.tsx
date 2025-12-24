'use client';

import React from 'react';


interface CouponWalletProps {
    couponCode: string;
    expiresAt: string;
    offerTitle: string;
    redemptionInstructions?: string[];
}

export default function CouponWallet({
    couponCode,
    expiresAt,
    offerTitle,
    redemptionInstructions = [
        "Show this code to the attendant",
        "Wait for verification",
        "Enjoy your reward!"
    ]
}: CouponWalletProps) {
    const redeemDate = new Date();
    const expiryDate = new Date(expiresAt);

    // Calculate time remaining (mock simple display for now)
    const diff = expiryDate.getTime() - redeemDate.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] font-sans pb-6">

            {/* Header / Title Area */}
            <div className="pt-8 pb-6 px-6 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold tracking-widest uppercase mb-4">
                    VERIFIED COUPON
                </span>

                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-6">
                    {offerTitle}
                </h2>

                {/* THE COUPON CODE HERO */}
                <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-3">
                        COUPON CODE
                    </p>
                    <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider break-words">
                        {couponCode}
                    </div>
                </div>
            </div>

            {/* The Green Status Box */}
            <div className="mx-6 mb-8 rounded-xl overflow-hidden border border-[#A3E635]/50 bg-[#f7fee7]">
                {/* Expires In */}
                <div className="py-4 text-center">
                    <p className="text-xs font-bold text-green-800 uppercase tracking-wider mb-1">
                        Expires in
                    </p>
                    <p className="text-xl font-black text-green-700 font-mono tracking-tight">
                        {hours}H {minutes}M 00S
                    </p>
                </div>
                {/* Redeemed On */}
                <div className="border-t border-[#A3E635]/20 py-2 text-center bg-[#ecfccb]/50">
                    <p className="text-[10px] font-semibold text-green-900/60 uppercase tracking-widest">
                        Activated: {redeemDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>

            {/* Instructions */}
            <div className="px-8 mb-4">
                <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                    HOW TO USE
                </p>
                <ol className="space-y-3 text-sm text-gray-600 font-medium">
                    {redemptionInstructions.map((step, idx) => (
                        <li key={idx} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 mt-0.5">
                                {idx + 1}
                            </span>
                            <span className="leading-snug">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
