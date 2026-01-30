import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// 加载环境变量
dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkStats() {
  // 1. 查找 Honoo Ramen Bar 商家信息
  const { data: merchant } = await supabase
    .from('merchants')
    .select('*')
    .or('slug.eq.honoo-ramen-bar-261242,name.ilike.%Honoo%')
    .single()

  if (!merchant) {
    console.log('❌ 未找到商家')
    return
  }

  console.log('🏪 商家信息:')
  console.log('  名称:', merchant.name)
  console.log('  Slug:', merchant.slug)
  console.log('  ID:', merchant.id)
  console.log('')

  // 2. 查询今天的数据
  const today = new Date().toISOString().split('T')[0]

  const { data: claims, error: claimsError } = await supabase
    .from('customer_claims')
    .select('*')
    .eq('merchant_id', merchant.id)
    .gte('created_at', today)

  if (claimsError) {
    console.log('Claims 查询错误:', claimsError)
  }

  const claimsCount = claims?.length || 0

  const redemptions = claims?.filter(c => c.status === 'redeemed' && c.redeemed_at && c.redeemed_at >= today) || []
  const redemptionsCount = redemptions.length

  console.log('📊 今天的数据 (' + today + '):')
  console.log('  领取数 (Claims):', claimsCount)
  console.log('  核销数 (Redemptions):', redemptionsCount)
  console.log('')

  // 3. 检查邮件发送记录
  console.log('📧 邮件发送情况:')

  const claimsWithEmail = claims?.filter(c => c.email) || []
  console.log('  今天领取且有邮箱的:', claimsWithEmail.length, '封')

  // 显示最近几个邮件
  if (claimsWithEmail.length > 0) {
    console.log('\n  最近的邮箱:')
    claimsWithEmail.slice(0, 10).forEach((c, i) => {
      console.log(`    ${i+1}. ${c.email} - ${c.name || '无姓名'} - ${new Date(c.created_at).toLocaleString()}`)
    })
  }

  // 4. 全部历史数据
  const { data: allClaims } = await supabase
    .from('customer_claims')
    .select('*')
    .eq('merchant_id', merchant.id)

  const totalClaims = allClaims?.length || 0
  const totalRedemptions = allClaims?.filter(c => c.status === 'redeemed').length || 0
  const totalEmails = allClaims?.filter(c => c.email).length || 0

  console.log('\n📈 历史总数据:')
  console.log('  总领取数:', totalClaims)
  console.log('  总核销数:', totalRedemptions)
  console.log('  总邮件数:', totalEmails)
  console.log('  转化率:', totalRedemptions && totalClaims ? `${(totalRedemptions/totalClaims*100).toFixed(1)}%` : 'N/A')
}

checkStats().catch(console.error)
