// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function fixAnalytics() {
  console.log('🔧 修复分析数据...\n')

  // Get all stats records
  const { data: allStats, error } = await supabase
    .from('landing_page_stats')
    .select('*')

  if (error) {
    console.error('❌ Error fetching stats:', error)
    return
  }

  console.log(`找到 ${allStats?.length || 0} 条统计记录\n`)

  for (const stat of allStats || []) {
    const pageViews = stat.total_page_views || 0
    const couponClaims = stat.total_coupon_claims || 0

    // Calculate conversion rate
    const conversionRate = pageViews > 0
      ? Number(((couponClaims / pageViews) * 100).toFixed(2))
      : 0

    console.log(`处理 merchant_id: ${stat.merchant_id}`)
    console.log(`  页面访问: ${pageViews}`)
    console.log(`  优惠券领取: ${couponClaims}`)
    console.log(`  旧转化率: ${stat.conversion_rate}%`)
    console.log(`  新转化率: ${conversionRate}%`)

    // Update if different
    if (stat.conversion_rate !== conversionRate) {
      const { error: updateError } = await supabase
        .from('landing_page_stats')
        .update({
          conversion_rate: conversionRate,
          last_calculated_at: new Date().toISOString(),
        })
        .eq('merchant_id', stat.merchant_id)

      if (updateError) {
        console.error(`  ❌ 更新失败:`, updateError.message)
      } else {
        console.log(`  ✅ 已更新转化率`)
      }
    } else {
      console.log(`  ⏭️  无需更新`)
    }

    console.log()
  }

  console.log('🎉 完成！')
}

fixAnalytics().catch(console.error)
