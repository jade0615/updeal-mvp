
import { config } from 'dotenv'
import { resolve } from 'path'

// Load env vars from .env.local parent directory
const envPath = resolve(process.cwd(), '.env.local')
config({ path: envPath })

const MERCHANT_SLUG = 'arcadia-special'

async function generateReport() {
    // Dynamic import to allow env vars to load first
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log(`📊 Generating Report for: ${MERCHANT_SLUG}\n`)

    // Get Merchant ID
    const { data: merchant } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('slug', MERCHANT_SLUG)
        .single()

    if (!merchant) {
        console.error('❌ Merchant not found')
        return
    }

    // Get Stats
    const { count: totalClaims } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)

    const { count: totalRedemptions } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id)
        .eq('status', 'redeemed')

    console.log(`Merchant: ${merchant.name}`)
    console.log(`Total Claims:      ${totalClaims}`)
    console.log(`Total Redemptions: ${totalRedemptions}`)
    console.log(`Redemption Rate:   ${totalClaims ? ((totalRedemptions || 0) / totalClaims * 100).toFixed(1) : 0}%\n`)

    // List recent redemptions
    const { data: redemptions } = await supabase
        .from('coupons')
        .select(`
            code,
            redeemed_at,
            created_at,
            users (
                phone
            )
        `)
        .eq('merchant_id', merchant.id)
        .eq('status', 'redeemed')
        .order('redeemed_at', { ascending: false })
        .limit(20)

    if (redemptions && redemptions.length > 0) {
        console.log('--- Recent Redemptions (Last 20) ---')
        console.log('Time                 | Phone        | Code')
        console.log('---------------------|--------------|-----------')
        redemptions.forEach((r: any) => {
            const time = new Date(r.redeemed_at).toLocaleString()
            const phone = r.users?.phone || 'Unknown'
            console.log(`${time.padEnd(20)} | ${phone.padEnd(12)} | ${r.code}`)
        })
    } else {
        console.log('No redemptions yet.')
    }

    // List Recent Claims (to debug duplicates)
    console.log('\n--- Recent Claims (All) ---')
    const { data: claims } = await supabase
        .from('coupons')
        .select(`
            code,
            created_at,
            users (
                phone,
                id
            )
        `)
        .eq('merchant_id', merchant.id)
        .order('created_at', { ascending: false })
        .limit(20)

    if (claims && claims.length > 0) {
        console.log('Created              | Phone        | User ID                              | Code')
        console.log('---------------------|--------------|--------------------------------------|-----------')
        claims.forEach((c: any) => {
            const time = new Date(c.created_at).toLocaleString()
            const phone = c.users?.phone || 'Unknown'
            const userId = c.users?.id || 'Unknown'
            console.log(`${time.padEnd(20)} | ${phone.padEnd(12)} | ${userId.padEnd(36)} | ${c.code}`)
        })
    }
}

generateReport().catch(console.error)
