'use client';

import { AppleWalletButton } from '@/components/ui/AppleWalletButton';

interface CouponWalletProps {
    couponCode: string;
    expiresAt: string;
    offerTitle: string;
    redemptionInstructions?: string[];
    merchantSlug?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
}

export default function CouponWallet({
    couponCode,
    expiresAt,
    offerTitle,
    redemptionInstructions = [
        "Show this code to staff to redeem",
        "Enjoy your reward!",
        "Valid for 30 days"
    ],
    merchantSlug,
    customerName,
    customerPhone,
    customerEmail
}: CouponWalletProps) {
    const redeemDate = new Date();
    const expiryDate = new Date(expiresAt);

    // Calculate time remaining (mock simple display for now)
    const diff = expiryDate.getTime() - redeemDate.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return (
        <div className="w-full max-w-sm mx-auto bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)] font-sans pb-8 border border-zinc-100">

            {/* Header / Title Area */}
            <div className="pt-10 pb-6 px-6 text-center">
                <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-600 text-[10px] font-black tracking-widest uppercase mb-6">
                    Verified Coupon
                </span>

                <h2 className="text-2xl font-black text-gray-900 leading-tight mb-8">
                    {offerTitle}
                </h2>

                {/* THE PROMINENT REDEMPTION CODE CARD */}
                <div className="bg-zinc-50 rounded-[2.5rem] p-10 border-2 border-dashed border-zinc-200 relative mb-8 shadow-inner">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.3em] whitespace-nowrap">
                        Redemption Code
                    </div>

                    <div className="py-2">
                        <code className="text-4xl sm:text-5xl font-mono font-black text-zinc-900 tracking-widest break-all leading-tight">
                            {couponCode}
                        </code>
                    </div>

                    <div className="mt-6 pt-6 border-t border-zinc-200/60">
                        <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                            Show this code to staff<br />
                            to redeem your offer
                        </p>
                    </div>
                </div>
            </div>

            {/* Expiry / Digital Wallet Section */}
            <div className="px-8 space-y-8">
                {/* Time Remaining */}
                <div className="text-center">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">
                        Expires in
                    </p>
                    <p className="text-2xl font-black text-zinc-900 font-mono tracking-tight">
                        {days > 0 ? `${days} DAYS ${hours}H` : `${hours} HOUR${hours > 1 ? 'S' : ''}`}
                    </p>
                </div>

                <div className="w-full flex flex-col items-center gap-4">
                    <div className="w-full bg-zinc-100/50 rounded-2xl p-1 text-center">
                        <AppleWalletButton
                            couponCode={couponCode}
                            className="w-full"
                            merchantSlug={merchantSlug}
                            customerName={customerName}
                            customerPhone={customerPhone}
                            customerEmail={customerEmail}
                        />
                    </div>
                </div>
            </div>

            {/* Footer / Instructions Area */}
            <div className="mt-8 px-8 py-6 bg-zinc-50/50 border-t border-zinc-100">
                <p className="text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">
                    Redemption Instructions
                </p>
                <ol className="space-y-4">
                    {redemptionInstructions.map((step, idx) => (
                        <li key={idx} className="flex gap-4 items-start">
                            <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-white border border-zinc-200 flex items-center justify-center text-[10px] font-black text-zinc-900 shadow-sm">
                                {idx + 1}
                            </span>
                            <span className="text-[13px] font-bold text-zinc-600 leading-snug">{step}</span>
                        </li>
                    ))}
                </ol>
            </div>
        </div>
    );
}
