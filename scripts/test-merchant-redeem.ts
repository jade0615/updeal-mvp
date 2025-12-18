// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function testMerchantRedeem() {
  console.log('🔍 测试商户专属核销页面...\n')

  // 查询所有测试商户
  const { data: merchants, error: merchantError } = await supabase
    .from('merchants')
    .select('id, name, slug, redeem_pin')
    .order('created_at', { ascending: true })
    .limit(5)

  if (merchantError || !merchants || merchants.length === 0) {
    console.log('❌ 未找到测试商户')
    console.log('Error:', merchantError)
    return
  }

  console.log('🏪 可用的商户核销页面:\n')

  for (const merchant of merchants) {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`📍 商户: ${merchant.name}`)
    console.log(`   Slug: ${merchant.slug}`)
    console.log(`   ID: ${merchant.id}`)
    console.log(`   密码: ${merchant.redeem_pin || '未设置'}`)

    // 查询该商户的可用优惠券
    const { data: coupons } = await supabase
      .from('coupons')
      .select('code, status')
      .eq('merchant_id', merchant.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(3)

    if (coupons && coupons.length > 0) {
      console.log(`\n   ✅ 可用优惠券:`)
      coupons.forEach(c => {
        console.log(`      • ${c.code}`)
      })
    } else {
      console.log(`\n   ⚠️  暂无可用优惠券`)
    }

    console.log(`\n   🔗 核销页面: http://localhost:3000/store-redeem/${merchant.slug}`)
    console.log(``)
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  console.log('📝 测试步骤:')
  console.log('  1️⃣  打开上面任一商户的核销页面')
  console.log('  2️⃣  输入店内密码（默认: 1234）')
  console.log('  3️⃣  输入该商户的优惠券代码')
  console.log('  4️⃣  点击核销按钮')
  console.log('  5️⃣  验证只能核销本商户的券码\n')

  console.log('🧪 测试场景:')
  console.log('  ✓ 正确场景: 在 bdragon-house 页面核销 BDRA-XXXX 券码 → 成功')
  console.log('  ✗ 错误场景: 在 bdragon-house 页面核销 BUND-XXXX 券码 → 提示"不属于本店"\n')

  // 测试跨商户券码
  console.log('🔬 跨商户验证测试:\n')

  for (let i = 0; i < Math.min(2, merchants.length); i++) {
    const merchant = merchants[i]
    const { data: coupons } = await supabase
      .from('coupons')
      .select('code, merchant_id')
      .eq('merchant_id', merchant.id)
      .eq('status', 'active')
      .limit(1)

    if (coupons && coupons.length > 0) {
      const coupon = coupons[0]
      console.log(`  ${merchant.name} (${merchant.slug}):`)
      console.log(`    ✓ 应该能核销: ${coupon.code}`)

      // 找一个其他商户的券
      const { data: otherCoupons } = await supabase
        .from('coupons')
        .select('code, merchant_id')
        .neq('merchant_id', merchant.id)
        .eq('status', 'active')
        .limit(1)

      if (otherCoupons && otherCoupons.length > 0) {
        console.log(`    ✗ 不应该能核销: ${otherCoupons[0].code}\n`)
      }
    }
  }
}

testMerchantRedeem().catch(console.error)
