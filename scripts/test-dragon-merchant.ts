// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function testDragonMerchant() {
  console.log('🔍 查询 bdragon house 商户信息...\n')

  // 查询商户
  const { data: merchant, error: merchantError } = await supabase
    .from('merchants')
    .select('*')
    .ilike('slug', '%dragon%')
    .single()

  if (merchantError || !merchant) {
    console.log('❌ 商户不存在')
    console.log('Error:', merchantError)
    return
  }

  console.log('🏪 商户信息:')
  console.log('  名称:', merchant.name)
  console.log('  Slug:', merchant.slug)
  console.log('  ID:', merchant.id)
  console.log('')

  // 查询该商户的优惠券
  const { data: coupons, error: couponError } = await supabase
    .from('coupons')
    .select('code, status, created_at')
    .eq('merchant_id', merchant.id)
    .order('created_at', { ascending: false })
    .limit(5)

  console.log('📋 最近的优惠券:')
  if (coupons && coupons.length > 0) {
    coupons.forEach(c => {
      const icon = c.status === 'active' ? '✅' : '✓'
      console.log('  ' + icon, c.code, '(' + c.status + ')')
    })
  } else {
    console.log('  还没有优惠券')
  }

  console.log('')
  console.log('🔗 测试链接:')
  console.log('  1. 领券页面: http://localhost:3000/' + merchant.slug)
  console.log('  2. 核销页面: http://localhost:3000/store-redeem')
  console.log('')
  console.log('📝 测试步骤:')
  console.log('  第1步: 打开领券页面，输入手机号领取优惠券')
  console.log('  第2步: 记下优惠券代码（如 BDRA-XXXX）')
  console.log('  第3步: 打开核销页面，输入券码进行核销')
  console.log('  第4步: 查看成功提示！')
}

testDragonMerchant().catch(console.error)
