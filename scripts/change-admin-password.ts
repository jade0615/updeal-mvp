/**
 * 修改管理员密码脚本
 *
 * 使用方法:
 * 1. 确保已安装 tsx: npm install -D tsx
 * 2. 设置环境变量或创建 .env.local
 * 3. 运行: npx tsx scripts/change-admin-password.ts
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import * as readline from 'readline'

// 加载环境变量
require('dotenv').config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function main() {
  console.log('\n🔐 UpDeal 管理员密码修改工具\n')

  // 获取所有管理员
  const { data: admins, error } = await supabase
    .from('admin_users')
    .select('id, email, name')

  if (error || !admins || admins.length === 0) {
    console.error('❌ 无法获取管理员列表:', error?.message)
    rl.close()
    return
  }

  console.log('现有管理员:')
  admins.forEach((admin, i) => {
    console.log(`  ${i + 1}. ${admin.email} (${admin.name || '无名称'})`)
  })

  const emailInput = await question('\n请输入要修改密码的管理员邮箱: ')
  const admin = admins.find(a => a.email.toLowerCase() === emailInput.toLowerCase())

  if (!admin) {
    console.error('❌ 找不到该管理员')
    rl.close()
    return
  }

  const newPassword = await question('请输入新密码 (至少8位): ')

  if (newPassword.length < 8) {
    console.error('❌ 密码太短，至少需要8位')
    rl.close()
    return
  }

  const confirmPassword = await question('请再次输入新密码: ')

  if (newPassword !== confirmPassword) {
    console.error('❌ 两次输入的密码不一致')
    rl.close()
    return
  }

  // 加密密码
  const passwordHash = await bcrypt.hash(newPassword, 10)

  // 更新数据库
  const { error: updateError } = await supabase
    .from('admin_users')
    .update({ password_hash: passwordHash })
    .eq('id', admin.id)

  if (updateError) {
    console.error('❌ 更新失败:', updateError.message)
  } else {
    console.log('\n✅ 密码已成功更新!')
    console.log(`   管理员: ${admin.email}`)
  }

  rl.close()
}

main().catch(console.error)
