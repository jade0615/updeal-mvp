
// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'
const envPath = resolve(process.cwd(), '.env.local')
console.log(`Loading env from: ${envPath}`)
config({ path: envPath })


const smsCampaigns = [
    // Campaign: Arcadia Holiday & Grand Opening (Unified)
    {
        slug: 'arcadia-special',
        name: 'Arcadia Holiday & Grand Opening',
        template_type: 'sushi',
        is_active: true,
        content: {
            businessName: 'ARCADIA',
            heroTitle: 'Grand Opening & Holiday Special',
            heroSubtitle: 'West Palm Beach',
            heroImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop', // Neon vibes
            offer: {
                value: 'ALL',
                unit: ' ACCESS',
                description: 'Grand Opening & Christmas Special: 5 FREE Tokens + VIP Spin! Play Passes (30/40/60 Mins). BOGO 50% OFF. Free Gift with Share!',
                type: 'bundle'
            },
            phone: '(561) 247-7312',
            address: {
                street: '2885D N Military Trail',
                area: 'West Palm Beach, FL 33409',
                fullAddress: '2885D N Military Trail, West Palm Beach, FL 33409'
            },
            openingHours: {
                isOpen: true,
                currentStatus: 'Open Daily',
                closingTime: '9:00 PM',
                specialHours: '11:00 AM – 9:00 PM'
            },
            reviews: [] // Reviews hidden in verified mode anyway
        }
    },
    // Campaign 3: King Super Buffet (10% Off)
    {
        slug: 'king-super-buffet',
        name: 'King Super Buffet',
        template_type: 'sushi',
        is_active: true,
        content: {
            businessName: 'King Super Buffet',
            heroTitle: 'Holiday Feast Special',
            heroSubtitle: 'West Palm Beach',
            heroImageUrl: 'https://images.unsplash.com/photo-1582254465498-6bc70419b607?q=80&w=2070&auto=format&fit=crop',
            offer: {
                value: '10%',
                unit: ' OFF',
                description: 'Enjoy 10% OFF Monday through Saturday. Perfect for families!',
                type: 'discount'
            },
            phone: '(561) 687-8886',
            address: '4270 Okeechobee Blvd, West Palm Beach, FL 33409',
            openingHours: {
                'Mon-Sat': '11:00 AM - 10:00 PM',
                'Sun': '11:00 AM - 9:30 PM'
            }
        }
    }
]

async function createCampaigns() {
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log('Creating SMS Campaign Landing Pages...\n')

    for (const merchant of smsCampaigns) {
        const { data, error } = await supabase
            .from('merchants')
            .upsert(merchant, { onConflict: 'slug' })
            .select()

        if (error) {
            console.error(`❌ Error creating ${merchant.slug}:`, error.message)
        } else {
            console.log(`✅ Created ${merchant.name} (http://localhost:3000/${merchant.slug})`)
        }
    }

    console.log('\n🎉 Campaign Pages Ready!')
}

createCampaigns().catch(console.error)
