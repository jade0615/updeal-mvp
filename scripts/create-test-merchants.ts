// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

const testMerchants = [
  {
    slug: 'test-discount',
    name: 'Discount Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'Discount Test',
      heroTitle: 'Amazing Sushi',
      heroSubtitle: 'New York, NY',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'discount',
      offer_value: '50%',
      offer_badge_text: '50% OFF',
      offerTitle: 'Christmas Special',
      offerDescription: 'Get 50% off your first order',
      offerDiscount: '50% OFF', // Fallback
      galleryImages: [],
      features: [],
      rating: '4.8',
      phone: '555-1234',
      address: '123 Sushi St, New York, NY'
    }
  },
  {
    slug: 'test-coupon',
    name: 'Coupon Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'Coupon Test',
      heroTitle: 'Student Sushi',
      heroSubtitle: 'Boston, MA',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'coupon',
      offer_value: '$10',
      offer_badge_text: 'Get $10 Off',
      offerTitle: 'Student Special',
      offerDescription: 'Show your student ID',
      offerDiscount: '$10 OFF',
      galleryImages: [],
      features: [],
      rating: '4.9',
      phone: '555-5678',
      address: '456 College Ave, Boston, MA'
    }
  },
  {
    slug: 'test-bogo',
    name: 'BOGO Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'BOGO Test',
      heroTitle: 'Happy Hour Sushi',
      heroSubtitle: 'San Francisco, CA',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'bogo',
      offer_value: 'Buy 1 Get 1',
      offer_badge_text: 'Buy 1 Get 1 Free',
      offerTitle: 'Happy Hour Special',
      offerDescription: '3pm - 6pm daily',
      offerDiscount: 'BOGO',
      galleryImages: [],
      features: [],
      rating: '4.7',
      phone: '555-9999',
      address: '789 Bay St, San Francisco, CA'
    }
  },
  {
    slug: 'test-reservation',
    name: 'Reservation Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'Reservation Test',
      heroTitle: 'Premium Sushi',
      heroSubtitle: 'Los Angeles, CA',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'reservation',
      offer_value: 'Book Now',
      offer_badge_text: 'Reserve Your Table',
      offerTitle: 'Weekend Special',
      offerDescription: 'Book ahead for priority seating',
      offerDiscount: 'Reservation',
      galleryImages: [],
      features: [],
      rating: '4.9',
      phone: '555-1111',
      address: '321 Sunset Blvd, Los Angeles, CA'
    }
  },
  {
    slug: 'test-freeitem',
    name: 'Free Item Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'Free Item Test',
      heroTitle: 'Welcome Sushi',
      heroSubtitle: 'Seattle, WA',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'free_item',
      offer_value: 'Free Appetizer',
      offer_badge_text: 'Free Spring Rolls',
      offerTitle: 'Welcome Gift',
      offerDescription: 'First-time customers only',
      offerDiscount: 'Free Gift',
      galleryImages: [],
      features: [],
      rating: '4.6',
      phone: '555-2222',
      address: '654 Pike St, Seattle, WA'
    }
  },
  {
    slug: 'test-bundle',
    name: 'Bundle Test',
    template_type: 'sushi',
    is_active: true,
    content: {
      businessName: 'Bundle Test',
      heroTitle: 'Combo Sushi',
      heroSubtitle: 'Chicago, IL',
      heroImageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351',
      offer_type: 'bundle',
      offer_value: '$29.99 Special',
      offer_badge_text: '2-Person Combo $29.99',
      offerTitle: "Couple's Dinner",
      offerDescription: 'Includes 2 entrees, appetizer, and drinks',
      offerDiscount: '$29.99',
      galleryImages: [],
      features: [],
      rating: '4.8',
      phone: '555-3333',
      address: '987 Michigan Ave, Chicago, IL'
    }
  }
]

async function createTestMerchants() {
  console.log('Creating test merchants...\n')

  for (const merchant of testMerchants) {
    const { data, error } = await supabase
      .from('merchants')
      .upsert(merchant, { onConflict: 'slug' })
      .select()

    if (error) {
      console.error(`❌ Error creating ${merchant.slug}:`, error.message)
    } else {
      console.log(`✅ Created ${merchant.slug} (${merchant.content.offer_type})`)
    }
  }

  console.log('\n🎉 Done! Test these URLs:\n')
  testMerchants.forEach(m => {
    console.log(`  ${m.content.offer_type?.toUpperCase().padEnd(12)} → http://localhost:3000/${m.slug}`)
  })

  console.log('\n📖 See TESTING_GUIDE.md for detailed testing instructions')
}

createTestMerchants().catch(console.error)
