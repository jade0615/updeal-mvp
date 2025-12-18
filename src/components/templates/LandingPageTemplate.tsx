'use client';

import { generateAvatar, generateClaimedAvatars } from './utils/avatarGenerator';
import BusinessInfo from './components/BusinessInfo';
import OfferCard from './components/OfferCard';
import ClaimForm from './components/ClaimForm';
import BusinessDetails from './components/BusinessDetails';
import ReviewsCarousel from './components/ReviewsCarousel';
import LandingHeader from './components/LandingHeader';
import LandingFooter from './components/LandingFooter';
import type { Merchant } from '@/types/merchant';

interface LandingPageProps {
    merchant: Merchant;
    claimedCount: number;
}

export default function LandingPageTemplate({ merchant, claimedCount }: LandingPageProps) {
    const { content } = merchant;

    // Logic to handle auto-generated avatars if logo is missing
    const logoUrl = content.logoUrl || generateAvatar(content.businessName, 200);

    // Social proof avatars
    const claimedAvatars = generateClaimedAvatars(3);

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100 selection:text-indigo-900">
            <LandingHeader />

            <main className="flex min-h-screen flex-col items-center justify-start px-4 py-20 sm:px-6 lg:px-8">
                <div className="w-full max-w-[420px] md:max-w-lg lg:max-w-xl">

                    <BusinessInfo
                        logoUrl={logoUrl}
                        name={content.businessName}
                        type={content.businessType}
                        priceRange={content.priceRange}
                        rating={content.rating}
                        reviewCount={content.reviewCount}
                        address={content.address}
                        establishedYear={content.establishedYear}
                    />

                    <OfferCard
                        offer={content.offer}
                        claimedCount={claimedCount}
                        claimedAvatars={claimedAvatars}
                    />

                    <ClaimForm
                        merchantId={merchant.id}
                    />

                    <BusinessDetails
                        openingHours={content.openingHours}
                        address={content.address}
                        phone={content.phone}
                        phoneNote={content.phoneNote}
                    />

                    <ReviewsCarousel reviews={content.reviews} />

                    <LandingFooter />

                </div>
            </main>
        </div>
    );
}
