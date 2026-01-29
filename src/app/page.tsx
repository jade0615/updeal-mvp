import React, { Suspense } from 'react';
import MobilePremiumTemplate from '@/components/templates/MobilePremiumTemplate';
import { Merchant } from '@/types/merchant';

// Mock data for the Gold-Blue Theme Demo
const DEMO_MERCHANT: Merchant = {
  id: 'demo-merchant-id',
  name: 'Golden Palace Demo',
  slug: 'golden-palace-demo',
  template_type: 'mobile_premium',
  virtual_base_count: 128,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  content: {
    businessName: "Golden Palace",
    businessType: "Fine Dining",
    priceRange: "$$$",
    establishedYear: 2024,
    rating: 4.9,
    reviewCount: "2.5k",
    heroTitle: "GRAND OPENING",
    heroSubtitle: "Experience the taste of luxury.",
    offer: {
      type: "Exclusive",
      value: "20%",
      unit: "OFF",
      description: "Get 20% OFF your first premium dining experience.",
      totalLimit: 500,
      virtual_base_count: 320
    },
    offer_badge_text: "LIMITED TIME",
    address: {
      street: "123 Gold Avenue",
      area: "Beverly Hills, CA 90210",
      fullAddress: "123 Gold Avenue, Beverly Hills, CA 90210"
    },
    phone: "+1 (555) 888-9999",
    openingHours: {
      isOpen: true,
      currentStatus: "Open Now",
      closingTime: "11 PM",
      specialHours: "Mon-Sun 11:00 AM - 11:00 PM"
    },
    website: "https://example.com",
    requirements: {
      collectName: true,
      collectEmail: false
    },
    menu: [],
    reviews: [
      {
        id: 1,
        rating: 5,
        text: "Absolutely stunning atmosphere and delicious food!",
        authorName: "Sarah J.",
        date: "2 days ago"
      },
      {
        id: 2,
        rating: 5,
        text: "The gold theme is beautiful. Highly recommended.",
        authorName: "Michael C.",
        date: "1 week ago"
      }
    ]
  }
} as any; // Cast to any to avoid strict type checks on optional fields if any mismatch

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-orange-400">Loading...</div>}>
      <MobilePremiumTemplate
        merchant={DEMO_MERCHANT}
        claimedCount={42}
        canEdit={false}
      />
    </Suspense>
  );
}
