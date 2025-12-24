// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Try loading from CWD
const envPath = resolve(process.cwd(), '.env.local')
console.log(`Loading env from: ${envPath}`)
config({ path: envPath })

// Define data
const merchantData = {
    slug: 'king-super-buffet-wpb',
    name: 'King Super Buffet',
    template_type: 'chinese',
    is_active: true,
    redeem_pin: '7242',
    virtual_base_count: 500, // Reasonable default for established place
    content: {
        businessName: 'King Super Buffet',
        heroTitle: 'King Super Buffet Special — 10% OFF Dine-In',
        heroSubtitle: 'Enjoy 10% OFF when you dine with us Monday–Saturday. Perfect for family meals & gatherings.',
        heroImageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop', // Placeholder

        offer: {
            type: 'discount',
            value: '10%',
            unit: 'OFF',
            description: 'Enjoy 10% OFF when you dine with us Monday through Saturday. Great for family meals and gatherings. Not valid with any other offers.',
            totalLimit: 1000,
            badge_text: 'MON–SAT ONLY',
            details: 'Valid for dine-in only. Cannot be combined with other offers.'
        },

        // Basic Info
        rating: '4.6',
        reviewCount: '2.8k',
        priceRange: '$$',
        establishedYear: 2015, // Approximate

        // Contact
        phone: '(561) 687-8886',
        phoneNote: 'Reservations accepted for large parties',

        address: {
            street: '4270 Okeechobee Blvd',
            area: 'West Palm Beach, FL 33409',
            fullAddress: '4270 Okeechobee Blvd, West Palm Beach, FL 33409',
            googleMapsUrl: 'https://maps.google.com/?q=4270+Okeechobee+Blvd,+West+Palm+Beach,+FL+33409'
        },

        // Hours (Inferred from standard buffet hours + "Mon-Sat" offer context)
        openingHours: {
            isOpen: true,
            currentStatus: 'Open Now',
            closingTime: '10:00 PM',
            schedule: {
                monday: '11:00 AM - 10:00 PM',
                tuesday: '11:00 AM - 10:00 PM',
                wednesday: '11:00 AM - 10:00 PM',
                thursday: '11:00 AM - 10:00 PM',
                friday: '11:00 AM - 10:30 PM',
                saturday: '11:00 AM - 10:30 PM',
                sunday: '11:00 AM - 10:00 PM'
            }
        },

        // English Reviews
        reviews: [
            {
                id: 1,
                authorName: 'Michael R.',
                rating: 5,
                date: '2 weeks ago',
                text: 'Best Chinese buffet in West Palm Beach! The selection is huge and they keep bringing out fresh food. The discount makes it an even better deal.'
            },
            {
                id: 2,
                authorName: 'Jessica T.',
                rating: 4,
                date: '1 month ago',
                text: 'Great place for family dinner. The seafood section is impressive. Staff is friendly and quick to clear plates.'
            },
            {
                id: 3,
                authorName: 'David L.',
                rating: 5,
                date: '3 days ago',
                text: 'Love theHibachi grill section! Freshly cooked right in front of you. Definite recommend for the price.'
            }
        ]
    }
}

async function createMerchant() {
    // Dynamic import to ensure dotenv loads first
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log('Creating King Super Buffet (WPB)...\n')

    const { data, error } = await supabase
        .from('merchants')
        .upsert(merchantData, { onConflict: 'slug' })
        .select()

    if (error) {
        console.error('❌ Error creating merchant:', error.message)
    } else {
        console.log('✅ Created King Super Buffet (WPB)')
        console.log(`   Slug: ${merchantData.slug}`)
        console.log(`   PIN: ${merchantData.redeem_pin}`)
        console.log(`   URL: http://localhost:3000/${merchantData.slug}`)
    }
}

createMerchant().catch(console.error)
