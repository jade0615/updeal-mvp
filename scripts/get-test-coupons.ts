// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function getTestCoupons() {
  console.log('📋 Getting test coupons...\n')

  const { data: coupons, error } = await supabase
    .from('coupons')
    .select(`
      code,
      status,
      created_at,
      merchants (name)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('Error:', error)
    return
  }

  if (!coupons || coupons.length === 0) {
    console.log('No coupons found')
    return
  }

  console.log('Latest coupons:\n')
  coupons.forEach((coupon: any) => {
    const status = coupon.status === 'active' ? '✅' : coupon.status === 'redeemed' ? '✓' : '❌'
    console.log(`${status} ${coupon.code} - ${coupon.merchants?.name || 'N/A'} (${coupon.status})`)
  })

  const activeCoupons = coupons.filter((c: any) => c.status === 'active')
  if (activeCoupons.length > 0) {
    console.log(`\n\n🎫 Use this code to test: ${activeCoupons[0].code}`)
    console.log(`\n📍 Test URL: http://localhost:3000/store-redeem`)
  } else {
    console.log('\n\n⚠️  No active coupons found. Please claim a new coupon first.')
    console.log('   Visit: http://localhost:3000/test-bundle')
  }
}

getTestCoupons().catch(console.error)
