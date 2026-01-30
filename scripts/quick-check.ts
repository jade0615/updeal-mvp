import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function quickCheck() {
  // 查询所有 customer_claims 数据
  const { data, error } = await supabase
    .from('customer_claims')
    .select('*')
    .limit(5)

  if (error) {
    console.log('错误:', error)
    return
  }

  console.log('查询到', data?.length || 0, '条数据')
  if (data && data.length > 0) {
    console.log('\n第一条数据示例:')
    console.log(JSON.stringify(data[0], null, 2))
  }

  // 统计总数
  const { data: all } = await supabase
    .from('customer_claims')
    .select('*')

  console.log('\n总记录数:', all?.length || 0)

  // 统计有邮箱的
  const withEmail = all?.filter(c => c.email) || []
  console.log('有邮箱的记录:', withEmail.length)

  // 今天的数据
  const today = new Date().toISOString().split('T')[0]
  const todayClaims = all?.filter(c => c.created_at && c.created_at.startsWith(today)) || []
  console.log('今天的记录:', todayClaims.length)
}

quickCheck().catch(console.error)
