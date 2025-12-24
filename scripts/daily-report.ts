
import { config } from 'dotenv'
import { resolve } from 'path'
import { createAdminClient } from '../src/lib/supabase/admin'

const envPath = resolve(process.cwd(), '.env.local')
config({ path: envPath })

const supabase = createAdminClient()

const MERCHANT_SLUG = 'arcadia-special'

async function generateReport() {
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
        .not('redeemed_at', 'is', null)

    console.log(`Merchant: ${merchant.name}`)
    console.log(`Total Claims:      ${totalClaims}`)
    console.log(`Total Redemptions: ${totalRedemptions}`)
    console.log(`Redemption Rate:   ${totalClaims ? ((totalRedemptions || 0) / totalClaims * 100).toFixed(1) : 0}%\n`)

    // List recent redemptions
    const { data: redemptions } = await supabase
        .from('coupons')
        .select('coupon_code, customer_phone, redeemed_at, created_at')
        .eq('merchant_id', merchant.id)
        .not('redeemed_at', 'is', null)
        .order('redeemed_at', { ascending: false })
        .limit(20)

    if (redemptions && redemptions.length > 0) {
        console.log('--- Recent Redemptions (Last 20) ---')
        console.log('Time                 | Phone        | Code')
        console.log('---------------------|--------------|-----------')
        redemptions.forEach(r => {
            const time = new Date(r.redeemed_at).toLocaleString()
            console.log(`${time.padEnd(20)} | ${r.customer_phone.padEnd(12)} | ${r.coupon_code}`)
        })
    } else {
        console.log('No redemptions yet.')
    }
}

generateReport().catch(console.error)
