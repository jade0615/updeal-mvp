'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { createSession, deleteSession } from '@/lib/auth/session'
import { cookies, headers } from 'next/headers'

// 简单的登录速率限制 (内存存储，重启后重置)
// 生产环境建议使用 Redis 或数据库
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION = 15 * 60 * 1000 // 15分钟

function getClientIP(): string {
  // 这是一个简化的实现，实际获取 IP 需要在 middleware 或 API route 中处理
  return 'default'
}

function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  if (!attempt) {
    return { allowed: true }
  }

  // 如果已超过锁定时间，重置
  if (now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.delete(identifier)
    return { allowed: true }
  }

  // 如果尝试次数超过限制
  if (attempt.count >= MAX_ATTEMPTS) {
    const remainingTime = Math.ceil((LOCKOUT_DURATION - (now - attempt.lastAttempt)) / 1000 / 60)
    return { allowed: false, remainingTime }
  }

  return { allowed: true }
}

function recordFailedAttempt(identifier: string) {
  const now = Date.now()
  const attempt = loginAttempts.get(identifier)

  if (!attempt || now - attempt.lastAttempt > LOCKOUT_DURATION) {
    loginAttempts.set(identifier, { count: 1, lastAttempt: now })
  } else {
    loginAttempts.set(identifier, { count: attempt.count + 1, lastAttempt: now })
  }
}

function clearAttempts(identifier: string) {
  loginAttempts.delete(identifier)
}

export async function loginAdmin(email: string, password: string) {
  // 使用 email 作为速率限制标识符
  const identifier = email.toLowerCase()

  // 检查速率限制
  const rateCheck = checkRateLimit(identifier)
  if (!rateCheck.allowed) {
    return { error: `登录尝试次数过多，请 ${rateCheck.remainingTime} 分钟后重试` }
  }

  const supabase = createAdminClient()

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (!admin) {
    recordFailedAttempt(identifier)
    return { error: '账号或密码错误' }
  }

  const isValid = await verifyPassword(password, admin.password_hash)
  if (!isValid) {
    recordFailedAttempt(identifier)
    return { error: '账号或密码错误' }
  }

  // 登录成功，清除失败记录
  clearAttempts(identifier)

  await createSession(admin.id)

  // 更新最后登录时间
  await supabase
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', admin.id)

  redirect('/admin')
}

export async function logoutAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('updeal_admin_session')?.value

  if (token) {
    await deleteSession(token)
  }

  redirect('/admin/login')
}
