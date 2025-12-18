import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import crypto from 'crypto'

const SESSION_COOKIE_NAME = 'updeal_admin_session'
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function createSession(adminUserId: string): Promise<string> {
  const supabase = createAdminClient()
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_DURATION)

  await supabase.from('admin_sessions').insert({
    admin_user_id: adminUserId,
    token,
    expires_at: expiresAt.toISOString()
  })

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt
  })

  return token
}

export async function validateSession(token: string) {
  const supabase = createAdminClient()

  const { data: session } = await supabase
    .from('admin_sessions')
    .select('*, admin_users(*)')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  return session?.admin_users || null
}

export async function deleteSession(token: string): Promise<void> {
  const supabase = createAdminClient()
  await supabase.from('admin_sessions').delete().eq('token', token)

  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
