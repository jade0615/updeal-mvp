'use server'

import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyPassword } from '@/lib/auth/password'
import { createSession, deleteSession } from '@/lib/auth/session'
import { cookies } from 'next/headers'

export async function loginAdmin(email: string, password: string) {
  const supabase = createAdminClient()

  const { data: admin } = await supabase
    .from('admin_users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (!admin) {
    return { error: '账号或密码错误' }
  }

  const isValid = await verifyPassword(password, admin.password_hash)
  if (!isValid) {
    return { error: '账号或密码错误' }
  }

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
