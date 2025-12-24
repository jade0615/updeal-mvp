// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

// Try loading from CWD
const envPath = resolve(process.cwd(), '.env.local')
console.log(`Loading env from: ${envPath}`)
config({ path: envPath })

// Define data (no dependencies)
const kingSuperBuffet = {
    slug: 'king-super-buffet',
    name: "King's Super Buffet",
    template_type: 'sushi',
    is_active: true,
    content: {
        businessName: "King's Super Buffet",
        heroTitle: 'All You Can Eat',
        heroSubtitle: 'Lauderhill, FL',
        heroImageUrl: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=2070&auto=format&fit=crop',

        offer: {
            type: 'discount',
            value: '10%',
            unit: 'OFF',
            description: 'Get 10% off your entire meal',
            totalLimit: 500,
            virtual_base_count: 342
        },

        rating: '4.5',
        reviewCount: '1.2k',
        priceRange: '$$',
        establishedYear: 2010,

        phone: '(954) 747-6668',
        phoneNote: 'Call for large groups',

        address: {
            street: '7101 W Oakland Park Blvd',
            area: 'Lauderhill, FL 33313',
            fullAddress: '7101 W Oakland Park Blvd, Lauderhill, FL 33313'
        },

        openingHours: {
            isOpen: true,
            currentStatus: 'Open Now',
            closingTime: '9:30 PM',
            schedule: {
                monday: '11:30 AM - 9:30 PM',
                tuesday: 'Closed',
                wednesday: '11:30 AM - 9:30 PM',
                thursday: '11:30 AM - 9:30 PM',
                friday: '11:30 AM - 10:00 PM',
                saturday: '11:30 AM - 10:00 PM',
                sunday: '11:30 AM - 9:30 PM'
            }
        },

        reviews: [
            {
                id: 1,
                authorName: 'Sarah M.',
                rating: 5,
                date: '2 days ago',
                text: 'Best buffet in Lauderhill! The seafood selection is amazing and everything is always fresh.'
            },
            {
                id: 2,
                authorName: 'John D.',
                rating: 4,
                date: '1 week ago',
                text: 'Great value for the price. The sushi bar is surprisingly good. Will come back.'
            },
            {
                id: 3,
                authorName: 'Maria R.',
                rating: 5,
                date: '3 weeks ago',
                text: 'Huge variety of food. My kids love the dessert section. Very clean and friendly staff.'
            }
        ]
    }
}

async function updateMerchant() {
    // Dynamic import to ensure dotenv loads first
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log('Updating King Super Buffet...\n')

    const { data, error } = await supabase
        .from('merchants')
        .upsert(kingSuperBuffet, { onConflict: 'slug' })
        .select()

    if (error) {
        console.error('❌ Error updating merchant:', error.message)
    } else {
        console.log('✅ Updated king-super-buffet')
        console.log('   Check it at: http://localhost:3000/king-super-buffet')
    }
}

updateMerchant().catch(console.error)
