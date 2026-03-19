'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMerchantSession } from '@/lib/merchant-auth'
import { sendSms } from '@/lib/sms'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface SmsRecipient {
    userId: string
    phone: string
    name: string | null
    couponCode: string
    couponStatus: string
    claimedAt: string
}

export interface SmsSendResult {
    phone: string
    name: string | null
    status: 'success' | 'failed'
    error?: string
}

// ─────────────────────────────────────────────
// Get all customers who have a phone number
// ─────────────────────────────────────────────

export async function getMerchantSmsRecipients(): Promise<{
    success: boolean
    recipients?: SmsRecipient[]
    merchantId?: string
    merchantName?: string
    error?: string
}> {
    try {
        const session = await getMerchantSession()
        if (!session?.merchants) {
            return { success: false, error: '未登录，请先登录商家账号' }
        }

        const merchant = session.merchants
        const supabase = createAdminClient()

        const { data: coupons, error } = await supabase
            .from('coupons')
            .select(`
                id,
                code,
                status,
                created_at,
                users ( id, phone, name )
            `)
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        const recipients: SmsRecipient[] = (coupons || [])
            .filter((c: any) => c.users?.phone)
            .map((c: any) => ({
                userId: c.users.id,
                phone: c.users.phone,
                name: c.users.name || null,
                couponCode: c.code,
                couponStatus: c.status,
                claimedAt: c.created_at,
            }))

        // Deduplicate by phone (keep most recent)
        const seen = new Map<string, SmsRecipient>()
        recipients.forEach(r => {
            if (!seen.has(r.phone)) seen.set(r.phone, r)
        })

        return {
            success: true,
            recipients: Array.from(seen.values()),
            merchantId: merchant.id,
            merchantName: merchant.name,
        }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ─────────────────────────────────────────────
// Send custom SMS to selected recipients
// ─────────────────────────────────────────────

export async function sendMerchantSmsAction(params: {
    recipients: { phone: string; name: string | null }[]
    message: string
}): Promise<{
    success: boolean
    results?: SmsSendResult[]
    sentCount?: number
    failedCount?: number
    error?: string
}> {
    try {
        const session = await getMerchantSession()
        if (!session?.merchants) {
            return { success: false, error: '未登录，请先登录商家账号' }
        }

        const merchant = session.merchants
        const supabase = createAdminClient()

        const results: SmsSendResult[] = []
        const campaignName = `sms-${merchant.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}`
        const sentAt = new Date().toISOString()

        for (const recipient of params.recipients) {
            const result = await sendSms(recipient.phone, params.message)

            const status = result.success ? 'success' : 'failed'
            results.push({
                phone: recipient.phone,
                name: recipient.name,
                status,
                error: result.success ? undefined : (result.error || 'Unknown error'),
            })

            // Write to sms_logs — silently ignore if table doesn't exist yet
            try {
                await supabase.from('sms_logs').insert({
                    merchant_id: merchant.id,
                    recipient_phone: recipient.phone,
                    recipient_name: recipient.name,
                    message: params.message,
                    status,
                    error_message: status === 'failed' ? (result.error || '') : null,
                    campaign_name: campaignName,
                    sent_at: sentAt,
                })
            } catch { /* ignore if sms_logs table not yet created */ }

            // Small delay to respect Twilio rate limits
            await new Promise(r => setTimeout(r, 200))
        }

        const sentCount = results.filter(r => r.status === 'success').length
        const failedCount = results.filter(r => r.status === 'failed').length

        return { success: true, results, sentCount, failedCount }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}

// ─────────────────────────────────────────────
// Fetch SMS logs for a merchant
// ─────────────────────────────────────────────

export interface SmsLog {
    id: string
    merchant_id: string | null
    recipient_phone: string
    recipient_name: string | null
    message: string
    status: 'success' | 'failed'
    error_message: string | null
    campaign_name: string | null
    sent_at: string
    created_at: string
}

export async function getMerchantSmsLogs(): Promise<{
    success: boolean
    logs?: SmsLog[]
    stats?: { total: number; success: number; failed: number }
    error?: string
}> {
    try {
        const session = await getMerchantSession()
        if (!session?.merchants) {
            return { success: false, error: '未登录' }
        }

        const supabase = createAdminClient()
        const { data: logs, error } = await supabase
            .from('sms_logs')
            .select('*')
            .eq('merchant_id', session.merchants.id)
            .order('sent_at', { ascending: false })
            .limit(100)

        if (error) throw error

        const total = logs?.length || 0
        const success = logs?.filter(l => l.status === 'success').length || 0
        const failed = logs?.filter(l => l.status === 'failed').length || 0

        return { success: true, logs: logs || [], stats: { total, success, failed } }
    } catch (e: any) {
        return { success: false, error: e.message, logs: [], stats: { total: 0, success: 0, failed: 0 } }
    }
}
