import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { sendSms } from '@/lib/sms'
import { sendWalletPush } from '@/lib/wallet/apns'

const BATCH_SIZE = 15    // emails to send per cron run
const DELAY_MS = 500   // ms between each email within a batch

/** Build a simple HTML email for campaign messages */
function buildCampaignHtml(name: string | null, bodyText: string, merchantName: string, couponCode?: string) {
    const escaped = bodyText.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Roboto, Arial, sans-serif; background: #f4f4f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 24px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,.06); }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 36px 24px; text-align: center; }
    .logo { color: #D4AF37; font-size: 28px; font-weight: 800; }
    .merchant { color: #94a3b8; font-size: 13px; margin-top: 6px; }
    .body { padding: 40px; color: #1E293B; line-height: 1.75; font-size: 15px; }
    .greeting { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .message { white-space: pre-wrap; }
    .coupon-box { margin: 28px 0; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; }
    .coupon-label { color: #64748b; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
    .coupon-code { color: #0F172A; font-size: 28px; font-weight: 900; letter-spacing: 4px; font-family: 'Courier New', monospace; }
    .coupon-hint { color: #94a3b8; font-size: 12px; margin-top: 8px; }
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
      <div class="message">${escaped}</div>
      ${couponCode ? `
      <div class="coupon-box">
        <div class="coupon-label">Your Code</div>
        <div class="coupon-code">${couponCode}</div>
        <div class="coupon-hint">Show this to our team when you visit</div>
      </div>` : ''}
    </div>
    <div class="footer"><p>Sent by ${merchantName} via Updeal.</p></div>
  </div>
</body>
</html>`
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createAdminClient()

        // Pick tasks that are due and still pending
        const { data: tasks, error } = await supabase
            .from('scheduled_messages')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true })
            .limit(5) // max 5 tasks per cron tick (each may process up to 15 recipients)

        if (error) {
            console.error('Cron fetch error:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        if (!tasks || tasks.length === 0) {
            return NextResponse.json({ success: true, processed: 0, remaining: 0 })
        }

        let totalSent = 0
        let totalFailed = 0

        for (const task of tasks) {
            // Atomically claim the task
            const { data: claimed } = await supabase
                .from('scheduled_messages')
                .update({ status: 'sending' })
                .eq('id', task.id)
                .eq('status', 'pending')
                .select()
                .single()

            if (!claimed) continue // another cron instance got it

            if (task.type === 'email') {
                const allRecipients = (task.recipients || []) as Array<{ email: string; name: string | null; couponCode?: string }>
                const currentIndex = task.sent_count || 0
                const batch = allRecipients.slice(currentIndex, currentIndex + BATCH_SIZE)
                const remainingCount = allRecipients.length - (currentIndex + batch.length)

                // Get merchant name for email template
                const { data: merchant } = await supabase
                    .from('merchants')
                    .select('name')
                    .eq('id', task.merchant_id)
                    .single()
                const merchantName = merchant?.name || 'Our Store'

                let batchSent = 0
                let batchFailed = 0
                const failedEmails: string[] = []

                for (const recipient of batch) {
                    const html = buildCampaignHtml(recipient.name, task.body, merchantName, recipient.couponCode)
                    const result = await sendEmail({ to: recipient.email, subject: task.subject || '', html })

                    if (result.success) {
                        batchSent++
                        // Log to email_logs
                        try {
                            await supabase.from('email_logs').insert({
                                merchant_id: task.merchant_id,
                                recipient_email: recipient.email,
                                recipient_name: recipient.name,
                                subject: task.subject,
                                template_name: 'store-campaign',
                                status: 'success',
                                campaign_name: `scheduled-${task.id.slice(0, 8)}`,
                                sent_at: new Date().toISOString(),
                            })
                        } catch { /* ignore */ }
                    } else {
                        batchFailed++
                        failedEmails.push(recipient.email)
                        console.error(`[cron] email failed for ${recipient.email}:`, result.error)
                    }

                    await new Promise(r => setTimeout(r, DELAY_MS))
                }

                totalSent += batchSent
                totalFailed += batchFailed

                if (remainingCount > 0) {
                    // More recipients to go — put back as pending and advance cursor
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: 'pending',
                            sent_count: currentIndex + batchSent,
                            error_message: failedEmails.length > 0 ? `已发 ${currentIndex + batchSent}，最新失败: ${failedEmails.join(', ')}` : null,
                        })
                        .eq('id', task.id)
                } else {
                    // All done
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: batchFailed > 0 && (currentIndex + batchSent) === 0 ? 'failed' : 'sent',
                            sent_count: currentIndex + batchSent,
                            sent_at: new Date().toISOString(),
                            error_message: failedEmails.length > 0 ? `失败: ${failedEmails.join(', ')}` : null,
                        })
                        .eq('id', task.id)
                }

            } else if (task.type === 'sms') {
                const allSmsRecipients = (task.recipients || []) as Array<{ phone: string; name?: string }>
                const currentIndex = task.sent_count || 0
                const smsBatch = allSmsRecipients.slice(currentIndex, currentIndex + BATCH_SIZE)
                const smsRemainingCount = allSmsRecipients.length - (currentIndex + smsBatch.length)

                let smsSent = 0
                let smsFailed = 0
                const smsErrors: string[] = []

                for (const r of smsBatch) {
                    const result = await sendSms(r.phone, task.body)
                    const status = result.success ? 'success' : 'failed'

                    try {
                        await supabase.from('sms_logs').insert({
                            merchant_id: task.merchant_id,
                            recipient_phone: r.phone,
                            recipient_name: r.name || null,
                            message: task.body,
                            status: status,
                            error_message: status === 'failed' ? (result.error || '') : null,
                            campaign_name: `scheduled-${task.id.slice(0, 8)}`,
                            sent_at: new Date().toISOString(),
                        })
                    } catch { /* ignore */ }

                    if (result.success) {
                        smsSent++
                    } else {
                        smsFailed++
                        smsErrors.push(`${r.phone}: ${result.error || '失败'}`)
                    }
                    await new Promise(r => setTimeout(r, 300))
                }

                if (smsRemainingCount > 0) {
                    // More to send — put back as pending and advance cursor
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: 'pending',
                            sent_count: currentIndex + smsSent,
                            error_message: smsErrors.length > 0 ? `已发 ${currentIndex + smsSent}，最新失败: ${smsErrors.slice(0, 3).join('; ')}` : null,
                        })
                        .eq('id', task.id)
                } else {
                    // All done
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: smsFailed > 0 && (currentIndex + smsSent) === 0 ? 'failed' : 'sent',
                            sent_count: currentIndex + smsSent,
                            sent_at: new Date().toISOString(),
                            error_message: smsErrors.length > 0 ? smsErrors.join('; ') : null,
                        })
                        .eq('id', task.id)
                }

                totalSent += smsSent
                totalFailed += smsFailed
            } else if (task.type === 'wallet_push') {
                try {
                    // Update all coupons for this merchant with the new wallet_message
                    // The task.body contains the message
                    await supabase
                        .from('coupons')
                        .update({ wallet_message: task.body })
                        .eq('merchant_id', task.merchant_id);

                    // Fetch all push tokens
                    const { data: registrations } = await supabase
                        .from('wallet_registrations')
                        .select('push_token, coupon_id')
                        .in('coupon_id', (
                            await supabase.from('coupons').select('id').eq('merchant_id', task.merchant_id)
                        ).data?.map(c => c.id) || []);

                    let sent = 0;
                    let failed = 0;

                    if (registrations && registrations.length > 0) {
                        for (const reg of registrations) {
                            const success = await sendWalletPush(reg.push_token);
                            if (success) {
                                sent++;
                            } else {
                                failed++;
                            }
                            // APNs allows relatively high throughput but we should respect a small delay
                            await new Promise(r => setTimeout(r, 10));
                        }
                    }

                    // Done
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: 'sent',
                            sent_count: sent,
                            error_message: failed > 0 ? `${failed} pushes failed` : null,
                            sent_at: new Date().toISOString()
                        })
                        .eq('id', task.id);

                    totalSent += sent;
                    totalFailed += failed;
                } catch (e: any) {
                    console.error("Wallet push error:", e);
                    await supabase
                        .from('scheduled_messages')
                        .update({
                            status: 'failed',
                            error_message: e.message
                        })
                        .eq('id', task.id);
                }
            }
        }

        // Count remaining pending tasks (for monitoring)
        const { count: remaining } = await supabase
            .from('scheduled_messages')
            .select('id', { count: 'exact', head: true })
            .eq('status', 'pending')

        console.log(`[send-scheduled] sent: ${totalSent}, failed: ${totalFailed}, pending tasks remaining: ${remaining}`)
        return NextResponse.json({ success: true, sent: totalSent, failed: totalFailed, pendingTasks: remaining })

    } catch (err: any) {
        console.error('send-scheduled cron error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
