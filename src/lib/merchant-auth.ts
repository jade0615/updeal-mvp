
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const COOKIE_NAME = 'merchant_session_token'

export async function getMerchantSession() {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const supabase = createAdminClient()

    const { data: session, error } = await supabase
        .from('merchant_sessions')
        .select('*, merchants(*)')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

    if (error || !session) return null

    return session
}

export async function requireMerchantAuth() {
    const session = await getMerchantSession()

    if (!session) {
        redirect('/merchant/login')
    }

    return session
}

export async function createMerchantSession(merchantId: string, remember: boolean = false) {
    const supabase = createAdminClient()
    const token = crypto.randomUUID()

    // 24 hours normally, 7 days if remember me
    const duration = remember ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
    const expiresAt = new Date(Date.now() + duration)

    await supabase.from('merchant_sessions').insert({
        merchant_id: merchantId,
        token,
        expires_at: expiresAt.toISOString()
    })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: expiresAt
    })

    return token
}

export async function logoutMerchant() {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (token) {
        const supabase = createAdminClient()
        await supabase.from('merchant_sessions').delete().eq('token', token)
    }

    cookieStore.delete(COOKIE_NAME)
}
