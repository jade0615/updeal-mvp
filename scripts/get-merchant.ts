import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function getMerchant() {
  // 查找 Honoo Ramen Bar 商家
  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('id, name, slug, content')
    .or('slug.eq.honoo-ramen-bar-261242,name.ilike.%Honoo%')
    .limit(1)
    .single()

  if (error) {
    console.log('查询错误:', error)

    // 如果找不到，尝试获取任意一个商家
    const { data: anyMerchant } = await supabase
      .from('merchants')
      .select('id, name, slug, content')
      .limit(1)
      .single()

    if (anyMerchant) {
      console.log('\n找到商家:')
      console.log('ID:', anyMerchant.id)
      console.log('名称:', anyMerchant.name)
      console.log('Slug:', anyMerchant.slug)
      console.log('地址:', anyMerchant.content?.address?.fullAddress || '无地址')
    }
    return
  }

  console.log('商家信息:')
  console.log('ID:', merchant.id)
  console.log('名称:', merchant.name)
  console.log('Slug:', merchant.slug)
  console.log('地址:', merchant.content?.address?.fullAddress || '无地址')
}

getMerchant().catch(console.error)
