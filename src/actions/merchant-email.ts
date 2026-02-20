'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMerchantSession } from '@/lib/merchant-auth'
import { sendEmail } from '@/lib/email'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface EmailRecipient {
    userId: string
    email: string
    name: string | null
    couponCode: string
    couponStatus: string
    claimedAt: string
}

export interface SendResult {
    email: string
    name: string | null
    status: 'success' | 'failed'
    error?: string
}

// ─────────────────────────────────────────────
// Get all customers who have an email address
// ─────────────────────────────────────────────

export async function getMerchantEmailRecipients(): Promise<{
    success: boolean
    recipients?: EmailRecipient[]
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
                users ( id, email, name )
            `)
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: false })

        if (error) throw error

        const recipients: EmailRecipient[] = (coupons || [])
            .filter((c: any) => c.users?.email)
            .map((c: any) => ({
                userId: c.users.id,
                email: c.users.email,
                name: c.users.name || null,
                couponCode: c.code,
                couponStatus: c.status,
                claimedAt: c.created_at,
            }))

        // Deduplicate by email (keep most recent)
        const seen = new Map<string, EmailRecipient>()
        recipients.forEach(r => {
            if (!seen.has(r.email.toLowerCase())) seen.set(r.email.toLowerCase(), r)
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
// Send custom email to selected recipients
// ─────────────────────────────────────────────

export async function sendMerchantEmailAction(params: {
    recipientEmails: string[]
    subject: string
    bodyText: string
}): Promise<{
    success: boolean
    results?: SendResult[]
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

        // Fetch recipient details for the selected emails
        const { data: users, error: userErr } = await supabase
            .from('users')
            .select('id, email, name')
            .in('email', params.recipientEmails)

        if (userErr) throw userErr

        // Build HTML from body text (wrap in brand template)
        const buildHtml = (name: string | null, bodyText: string, merchantName: string) => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 24px; text-align: center; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .merchant { color: #94a3b8; font-size: 13px; margin-top: 6px; }
    .body { padding: 40px; color: #1E293B; line-height: 1.75; font-size: 15px; }
    .greeting { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .message { white-space: pre-wrap; }
    .footer { padding: 24px; text-align: center; font-size: 13px; color: #94a3b8; background: #f8fafc; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">UPDEAL</div>
      <div class="merchant">${merchantName}</div>
    </div>
    <div class="body">
      <div class="greeting">Hi ${name || 'there'},</div>
      <div class="message">${bodyText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${merchantName} &amp; Updeal. All rights reserved.</p>
      <p>This is a message from your merchant. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>`

        const results: SendResult[] = []
        const campaignName = `merchant-${merchant.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}`
        const sentAt = new Date().toISOString()

        for (const user of (users || [])) {
            const html = buildHtml(user.name, params.bodyText, merchant.name)
            const result = await sendEmail({ to: user.email, subject: params.subject, html })

            const status = result.success ? 'success' : 'failed'
            results.push({
                email: user.email,
                name: user.name,
                status,
                error: result.success ? undefined : String((result as any).error || 'Unknown error'),
            })

            // Write to email_logs
            await supabase.from('email_logs').insert({
                merchant_id: merchant.id,
                recipient_email: user.email,
                recipient_name: user.name,
                subject: params.subject,
                template_name: 'merchant-custom',
                html_content: html,
                status,
                error_message: status === 'failed' ? String((result as any).error || '') : null,
                campaign_name: campaignName,
                sent_at: sentAt,
            })

            // Small delay to respect SMTP rate limits
            await new Promise(r => setTimeout(r, 300))
        }

        const sentCount = results.filter(r => r.status === 'success').length
        const failedCount = results.filter(r => r.status === 'failed').length

        return { success: true, results, sentCount, failedCount }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
