// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function checkAnalytics() {
  console.log('🔍 检查分析数据...\n')

  // 1. Check merchants
  const { data: merchants, error: merchError } = await supabase
    .from('merchants')
    .select('id, name, slug')
    .order('created_at', { ascending: false })
    .limit(10)

  if (merchError) {
    console.error('❌ Error fetching merchants:', merchError)
    return
  }

  console.log(`📊 找到 ${merchants?.length || 0} 个商家\n`)

  // 2. Check landing_page_stats
  const { data: stats, error: statsError } = await supabase
    .from('landing_page_stats')
    .select('*')

  if (statsError) {
    console.error('❌ Error fetching stats:', statsError)
  } else {
    console.log(`📈 landing_page_stats 表中有 ${stats?.length || 0} 条记录\n`)

    if (stats && stats.length > 0) {
      console.log('详细统计数据：')
      stats.forEach((stat: any) => {
        const merchant = merchants?.find(m => m.id === stat.merchant_id)
        console.log(`  - ${merchant?.name || 'Unknown'} (${merchant?.slug}):`)
        console.log(`    页面访问: ${stat.total_page_views || 0}`)
        console.log(`    表单提交: ${stat.total_form_submits || 0}`)
        console.log(`    优惠券领取: ${stat.total_coupon_claims || 0}`)
        console.log(`    转化率: ${stat.conversion_rate || 0}%`)
        console.log(`    最后更新: ${stat.last_calculated_at || 'N/A'}`)
        console.log()
      })
    }
  }

  // 3. Check events
  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (eventsError) {
    console.error('❌ Error fetching events:', eventsError)
  } else {
    console.log(`🎯 events 表中有最近 ${events?.length || 0} 条事件\n`)

    if (events && events.length > 0) {
      console.log('最近的事件：')
      events.forEach((event: any) => {
        const merchant = merchants?.find(m => m.id === event.merchant_id)
        console.log(`  - ${event.event_type} - ${merchant?.name || 'Unknown'} - ${new Date(event.created_at).toLocaleString()}`)
      })
      console.log()
    }
  }

  // 4. Check coupons
  const { data: coupons, error: couponsError } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false})
    .limit(10)

  if (couponsError) {
    console.error('❌ Error fetching coupons:', couponsError)
  } else {
    console.log(`🎟️ coupons 表中有 ${coupons?.length || 0} 张优惠券\n`)

    if (coupons && coupons.length > 0) {
      console.log('最近的优惠券：')
      coupons.forEach((coupon: any) => {
        const merchant = merchants?.find(m => m.id === coupon.merchant_id)
        console.log(`  - ${coupon.code} - ${merchant?.name || 'Unknown'} - ${coupon.status} - ${new Date(coupon.created_at).toLocaleString()}`)
      })
      console.log()
    }
  }

  // Summary
  console.log('=' .repeat(50))
  console.log('总结：')
  console.log(`  商家数量: ${merchants?.length || 0}`)
  console.log(`  统计记录: ${stats?.length || 0}`)
  console.log(`  事件记录: ${events?.length || 0}`)
  console.log(`  优惠券数: ${coupons?.length || 0}`)
  console.log('=' .repeat(50))
}

checkAnalytics().catch(console.error)
