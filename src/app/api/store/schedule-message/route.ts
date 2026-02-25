import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { twilioClient, SMS_FROM_NUMBER } from '@/lib/sms'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { merchantSlug, merchantId, type, recipients, subject, body: messageBody, scheduledLocalTime } = body

        if (!merchantSlug || !merchantId || !type || !recipients?.length || !messageBody || !scheduledLocalTime) {
            return NextResponse.json({ error: '参数缺失' }, { status: 400 })
        }
        if (!['email', 'sms'].includes(type)) {
            return NextResponse.json({ error: '类型无效' }, { status: 400 })
        }
        if (type === 'email' && !subject) {
            return NextResponse.json({ error: '邮件主题缺失' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Verify merchant and get timezone
        const { data: merchant, error: mErr } = await supabase
            .from('merchants')
            .select('id, name, timezone')
            .eq('id', merchantId)
            .eq('slug', merchantSlug)
            .single()

        if (mErr || !merchant) {
            return NextResponse.json({ error: '商家验证失败' }, { status: 403 })
        }

        const timezone = merchant.timezone || 'America/New_York'

        // scheduledLocalTime is a naive datetime string "2026-02-25T14:30"
        // interpreted as the merchant's local timezone
        const scheduledAt = localToUTC(scheduledLocalTime, timezone)

        if (isNaN(scheduledAt.getTime())) {
            return NextResponse.json({ error: '时间格式无效' }, { status: 400 })
        }

        if (scheduledAt <= new Date()) {
            const nowLocal = new Date().toLocaleString('zh-CN', { timeZone: timezone, hour12: false })
            return NextResponse.json({
                error: `定时时间必须是未来时间（当前门店时间：${nowLocal}，请以${timezone}时区为准）`
            }, { status: 400 })
        }

        // ── Pre-flight check for email ─────────────────────────────────────
        // Try sending one test email to our own address to verify Aliyun
        // won't reject the subject/body before we queue 200+ recipients.
        if (type === 'email') {
            const testHtml = `<div style="font-family:sans-serif;padding:16px;color:#555">
              <p><strong>[Pre-flight test — ${merchant.name}]</strong></p>
              <p>${messageBody.replace(/\n/g, '<br>')}</p>
              <p style="color:#aaa;font-size:11px">This is an automated content check.</p>
            </div>`

            const testResult = await sendEmail({
                to: 'info@hiraccoon.com',
                subject: `[TEST] ${subject}`,
                html: testHtml,
            })

            if (!testResult.success) {
                // Extract error string from unknown type
                const rawErr: string = testResult.error instanceof Error
                    ? testResult.error.message
                    : String(testResult.error || '')

                let friendlyError = rawErr

                if (rawErr.toLowerCase().includes('spam')) {
                    friendlyError = '邮件内容被检测为垃圾邮件（spam）。请修改主题或正文，避免使用 FREE、FINAL CALL、ACT NOW 等词语后再试。'
                } else if (rawErr.includes('550') || rawErr.includes('554')) {
                    friendlyError = `邮件内容被阿里云拒绝：${rawErr.slice(0, 120)}`
                } else if (rawErr.toLowerCase().includes('auth')) {
                    friendlyError = '邮件服务器认证失败，请联系管理员。'
                }

                return NextResponse.json({
                    error: `❌ 预检失败，邮件无法发送：${friendlyError}`,
                    preflight: false,
                }, { status: 422 })
            }
        }

        // ── Pre-flight check for SMS ───────────────────────────────────────
        // Validate Twilio config and connectivity before queueing.
        // We use Twilio's official magic test number (+15005550006) so no SMS
        // is actually sent and no credit is consumed — but auth/account errors
        // will still surface immediately.
        if (type === 'sms') {
            if (!twilioClient) {
                return NextResponse.json({
                    error: '❌ Twilio 未配置（TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN 缺失），无法发送短信，请联系管理员。',
                    preflight: false,
                }, { status: 422 })
            }
            if (!SMS_FROM_NUMBER) {
                return NextResponse.json({
                    error: '❌ TWILIO_FROM_NUMBER 未配置，无法发送短信，请联系管理员。',
                    preflight: false,
                }, { status: 422 })
            }

            try {
                // Twilio magic test number: validates auth + account status without sending.
                await twilioClient.messages.create({
                    from: SMS_FROM_NUMBER,
                    to: '+15005550006',
                    body: `[Updeal preflight] SMS config check for ${merchant.name}`,
                })
            } catch (twilioErr: any) {
                const msg: string = twilioErr?.message || String(twilioErr)
                let friendlyError = msg

                if (msg.includes('authenticate') || msg.includes('401') || msg.includes('20003')) {
                    friendlyError = 'Twilio 账户认证失败，请检查 TWILIO_ACCOUNT_SID 和 TWILIO_AUTH_TOKEN 是否正确。'
                } else if (msg.includes('21212') || msg.includes('from number')) {
                    friendlyError = 'Twilio 发送号码（TWILIO_FROM_NUMBER）无效，请联系管理员检查配置。'
                } else if (msg.includes('insufficient') || msg.includes('quota') || msg.includes('20008')) {
                    friendlyError = 'Twilio 账户余额不足，请充值后再试。'
                }

                return NextResponse.json({
                    error: `❌ 短信预检失败，定时任务未保存：${friendlyError}`,
                    preflight: false,
                }, { status: 422 })
            }
        }

        // ── Queue the task ─────────────────────────────────────────────────
        const { data: task, error: insertErr } = await supabase
            .from('scheduled_messages')
            .insert({
                merchant_id: merchantId,
                type,
                recipients,
                subject: subject || null,
                body: messageBody,
                scheduled_at: scheduledAt.toISOString(),
                status: 'pending',
            })
            .select('id, scheduled_at')
            .single()

        if (insertErr) {
            console.error('Schedule insert error:', insertErr)
            return NextResponse.json({ error: '保存失败: ' + insertErr.message }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            taskId: task.id,
            scheduledAt: task.scheduled_at,
            timezone,
            preflight: true,
        })
    } catch (err: any) {
        console.error('Schedule message error:', err)
        return NextResponse.json({ error: err.message || '内部错误' }, { status: 500 })
    }
}

/**
 * Convert a local datetime string (YYYY-MM-DDTHH:mm) in the given IANA timezone to a UTC Date.
 */
function localToUTC(localDatetime: string, timezone: string): Date {
    const [datePart, timePart] = localDatetime.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = (timePart || '00:00').split(':').map(Number)

    const assumedUTC = new Date(Date.UTC(year, month - 1, day, hour, minute))

    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
    })
    const parts = formatter.formatToParts(assumedUTC)
    const tzHour = parseInt(parts.find(p => p.type === 'hour')!.value)
    const tzMinute = parseInt(parts.find(p => p.type === 'minute')!.value)

    const wantedMinutes = hour * 60 + minute
    const gotMinutes = tzHour * 60 + tzMinute
    let offsetMinutes = wantedMinutes - gotMinutes
    if (offsetMinutes > 12 * 60) offsetMinutes -= 24 * 60
    if (offsetMinutes < -12 * 60) offsetMinutes += 24 * 60

    return new Date(assumedUTC.getTime() - offsetMinutes * 60 * 1000)
}
