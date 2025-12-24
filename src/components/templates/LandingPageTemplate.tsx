'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import confetti from 'canvas-confetti';
import { generateClaimedAvatars } from './utils/avatarGenerator';
import OfferCard from './components/OfferCard';
import ClaimForm from './components/ClaimForm';
import QuickClaimForm from './components/QuickClaimForm';
import CouponWallet from './components/CouponWallet';
import BusinessDetails from './components/BusinessDetails';
import ReviewsCarousel from './components/ReviewsCarousel';
import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';
import type { Merchant } from '@/types/merchant';
import { ShieldCheck, ChevronRight } from 'lucide-react';

interface LandingPageProps {
    merchant: Merchant;
    claimedCount: number;
}

export default function LandingPageTemplate({ merchant, claimedCount }: LandingPageProps) {
    const searchParams = useSearchParams();
    // Check for 'phone' or 'p' param
    const verifiedPhone = searchParams.get('phone') || searchParams.get('p');

    const { content } = merchant;
    const claimedAvatars = generateClaimedAvatars(3);
    const [isClaimed, setIsClaimed] = useState(false);
    const [couponData, setCouponData] = useState<any>(null);

    const handleClaimSuccess = (data: any) => {
        setIsClaimed(true);
        setCouponData(data);
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#FF5722', '#FFC107', '#FFFFFF', '#4CAF50']
        });
    };

    return (
        <div className={`min-h-screen font-inter selection:bg-orange-500/30 antialiased overflow-x-hidden ${verifiedPhone ? 'bg-white text-zinc-900' : 'bg-zinc-950 text-white'}`}>
            <LandingHeader />

            {/* Linear-Style Split Hero Section */}
            <div className={`relative z-10 w-full max-w-[1400px] mx-auto px-6 grid grid-cols-1 ${verifiedPhone ? 'lg:grid-cols-1 max-w-3xl min-h-0' : 'lg:grid-cols-2 lg:h-[90vh] min-h-[700px]'} gap-0 items-stretch overflow-hidden`}>

                {/* Left Section: Text Zone (Magazine Layout) */}
                <div className={`flex flex-col justifies-center ${verifiedPhone ? 'items-center text-center mx-auto py-12' : 'items-start py-24'} ${verifiedPhone ? 'space-y-6' : 'space-y-12'} pr-12 animate-in fade-in slide-in-from-left-20 duration-1000`}>
                    <div className="space-y-6">
                        <div className={`flex items-center gap-4 ${verifiedPhone ? 'justify-center' : ''}`}>
                            <div className="h-[2px] w-12 bg-orange-600" />
                            <span className="text-[12px] font-black tracking-[0.4em] text-orange-500 uppercase">Premium Member Offer</span>
                        </div>

                        <h1 className={`text-[72px] sm:text-[96px] lg:text-[120px] font-bold leading-[0.85] tracking-tighter ${verifiedPhone ? 'text-zinc-900' : 'text-white'}`}>
                            {content.businessName}
                        </h1>                    </div>

                    <div className="space-y-8 max-w-xl">
                        <p className={`text-[20px] sm:text-[24px] font-medium leading-relaxed tracking-tight ${verifiedPhone ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            Unlock exclusive digital benefits and immediate rewards.
                            Experience hospitality at its finest with our verified member program.
                        </p>
                        <div className="flex flex-wrap items-center gap-6 pt-4">
                            {!verifiedPhone && (
                                <a
                                    href="#claim"
                                    className="group flex items-center gap-4 px-10 py-5 bg-white text-black rounded-full font-bold text-xl hover:bg-zinc-200 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                                >
                                    Get VIP Access
                                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                </a>
                            )}
                            {!verifiedPhone && (
                                <div className="flex flex-col">
                                    <span className="text-zinc-500 text-xs font-black tracking-widest uppercase">Verified by</span>
                                    <span className="text-white text-lg font-bold">Updeal</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Section: Visual Zone (Bento Container) */}
                {!verifiedPhone && (
                    <div className="relative w-full h-[600px] lg:h-auto py-12 lg:py-24 animate-in fade-in slide-in-from-right-20 duration-1000 delay-200">
                        {/* The Visual Container */}
                        <div className="relative h-full w-full rounded-[48px] overflow-hidden border border-white/5 bg-zinc-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] group">
                            <img
                                src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop"
                                alt={content.businessName}
                                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />

                            {/* THE GLASS CARD: Absolute Positioned - Bottom Right */}
                            <div className="absolute bottom-12 right-12 z-30 w-full max-w-[340px] animate-float-slow">
                                <OfferCard
                                    offer={content.offer}
                                    claimedCount={claimedCount}
                                    claimedAvatars={claimedAvatars}
                                    merchantName={content.businessName}
                                />
                            </div>

                            {/* Subtle Badge */}
                            <div className="absolute top-12 left-12">
                                <div className="flex items-center gap-3 px-6 py-3 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    <span className="text-[12px] font-bold text-white tracking-widest uppercase">Member Exclusive</span>
                                </div>
                            </div>
                        </div>

                        {/* Background Light Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-orange-600/5 blur-[120px] -z-10" />
                    </div>
                )}            </div>

            {/* Secondary Sections */}
            <main id="claim" className={`relative z-10 w-full max-w-lg mx-auto px-6 ${verifiedPhone ? 'py-4 space-y-8' : 'py-32 space-y-24'}`}>

                {/* Claim Form Section */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Activate Memberships</h2>
                        <p className="text-zinc-500 text-sm font-medium">Verify your phone to lock in your {content.offer.value}{content.offer.unit} discount.</p>
                    </div>

                    <div className={`relative transition-all duration-700 ${isClaimed ? 'scale-100 opacity-100' : ''}`}>
                        {isClaimed && couponData ? (
                            <div className="animate-in zoom-in duration-500">
                                <CouponWallet
                                    couponCode={couponData.coupon?.code || 'CODE123'}
                                    expiresAt={couponData.coupon?.expiresAt || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()}
                                    offerTitle={content.offer.value + ' ' + content.offer.unit}
                                />
                            </div>
                        ) : (
                            <div className={`relative backdrop-blur-3xl border rounded-[40px] p-2 ${verifiedPhone ? 'bg-white border-zinc-200 shadow-xl' : 'bg-zinc-900/50 border-white/10'} ${isClaimed ? 'hidden' : ''}`}>
                                {verifiedPhone ? (
                                    <QuickClaimForm
                                        merchantId={merchant.id}
                                        phone={verifiedPhone}
                                        onClaimSuccess={handleClaimSuccess}
                                    />
                                ) : (
                                    <ClaimForm
                                        merchantId={merchant.id}
                                        onClaimSuccess={handleClaimSuccess}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Business Info Grid */}
                <div className="space-y-16">
                    <BusinessDetails
                        openingHours={content.openingHours}
                        address={content.address}
                        phone={content.phone}
                        phoneNote={content.phoneNote}
                    />

                    {!verifiedPhone && (
                        <div className="opacity-80 hover:opacity-100 transition-opacity">
                            <ReviewsCarousel reviews={content.reviews} />
                        </div>
                    )}
                </div>

                <div className="pt-24 border-t border-white/5">
                    <LandingFooter hideBranding={!!verifiedPhone} />
                </div>
            </main >

            {/* Global Overlays */}
            {!verifiedPhone && (
                <div className="fixed inset-0 pointer-events-none noise-overlay opacity-[0.02] z-50" />
            )}
        </div >
    );
}
