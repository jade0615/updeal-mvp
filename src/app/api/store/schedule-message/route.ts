import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/email'
import { twilioClient, SMS_FROM_NUMBER } from '@/lib/sms'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { merchantSlug, merchantId, type, recipients, subject, body: messageBody, scheduledLocalTime, scheduledAtUTC } = body

        if (!merchantSlug || !merchantId || !type || !recipients?.length || !messageBody || (!scheduledLocalTime && !scheduledAtUTC)) {
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

        // Prefer scheduledAtUTC (ISO string from frontend) over localToUTC conversion
        let scheduledAt: Date
        if (scheduledAtUTC) {
            scheduledAt = new Date(scheduledAtUTC)
        } else {
            scheduledAt = localToUTC(scheduledLocalTime, timezone)
        }

        if (isNaN(scheduledAt.getTime())) {
            return NextResponse.json({ error: '时间格式无效' }, { status: 400 })
        }

        // Log for debugging (no longer reject past times — cron will handle timing)
        console.log('[schedule-message] input:', scheduledAtUTC || scheduledLocalTime, '→ UTC:', scheduledAt.toISOString(), '| now UTC:', new Date().toISOString())


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
/**
 * Convert a naive local datetime string (e.g. "2026-02-25T11:52") in the
 * given IANA timezone to a UTC Date.
 *
 * Strategy: binary-search the UTC offset by asking Intl.DateTimeFormat what
 * local time corresponds to a given UTC instant, then adjust until they match.
 * This handles DST transitions correctly.
 */
function localToUTC(localDatetime: string, timezone: string): Date {
    // Parse the naive string — treat it as if it were UTC first (no offset)
    const [datePart, timePart] = localDatetime.split('T')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = (timePart || '00:00').split(':').map(Number)

    if (!year || isNaN(hour)) return new Date(NaN)

    // Target: we want the clock in `timezone` to show `hour:minute` on that date.
    // We make a first guess assuming UTC-5 (EST) which is what NY is in winter.
    // Then we measure the actual offset and correct.
    const guessUTC = new Date(Date.UTC(year, month - 1, day, hour, minute))

    const fmt = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    })

    // Helper: given a UTC Date, what does the clock show in `timezone`?
    function getLocalParts(utc: Date) {
        const parts = fmt.formatToParts(utc)
        const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0')
        return { h: get('hour'), m: get('minute'), yr: get('year'), mo: get('month'), d: get('day') }
    }

    // Iteratively correct: measure offset from first guess, apply, then verify
    let utc = guessUTC
    for (let i = 0; i < 3; i++) {
        const local = getLocalParts(utc)
        // Difference in minutes between what clock shows and what we want
        const localMinutesOfDay = local.h * 60 + local.m
        const wantedMinutesOfDay = hour * 60 + minute
        let diff = wantedMinutesOfDay - localMinutesOfDay
        // Handle midnight boundary
        if (diff > 12 * 60) diff -= 24 * 60
        if (diff < -12 * 60) diff += 24 * 60
        // Also check if the date itself shifted
        const localDateMs = Date.UTC(local.yr, local.mo - 1, local.d)
        const wantDateMs = Date.UTC(year, month - 1, day)
        const dayShiftMs = wantDateMs - localDateMs
        utc = new Date(utc.getTime() + diff * 60_000 + dayShiftMs)
    }

    return utc
}

