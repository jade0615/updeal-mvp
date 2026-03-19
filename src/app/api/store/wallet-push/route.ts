import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import http2 from 'http2'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { merchantId, merchantSlug, pushTokens, message } = body

        if (!merchantId || !merchantSlug || !pushTokens?.length || !message?.trim()) {
            return NextResponse.json({ success: false, error: '参数缺失' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Verify merchant
        const { data: merchant, error: mErr } = await supabase
            .from('merchants')
            .select('id, name')
            .eq('id', merchantId)
            .eq('slug', merchantSlug)
            .single()

        if (mErr || !merchant) {
            return NextResponse.json({ success: false, error: '商家验证失败' }, { status: 403 })
        }

        const passTypeId = (process.env.APPLE_PASS_TYPE_ID || '').trim().replace(/\\n/g, '').replace(/\n/g, '')
        const certBase64 = (process.env.APPLE_SIGNER_CERT || '').trim().replace(/\\n/g, '').replace(/\n/g, '')
        const keyBase64 = (process.env.APPLE_SIGNER_KEY || '').trim().replace(/\\n/g, '').replace(/\n/g, '')
        const keyPassword = (process.env.APPLE_SIGNER_KEY_PASSWORD || '').trim()

        if (!passTypeId || !certBase64 || !keyBase64) {
            return NextResponse.json({ success: false, error: 'Apple 证书未完整配置' }, { status: 500 })
        }

        // ── Step 1: Save message to coupons.wallet_message ──────────────────
        // Look up coupon_ids from the push tokens so we know which coupons to update
        const { data: regRows } = await supabase
            .from('wallet_registrations')
            .select('coupon_id')
            .in('push_token', pushTokens)

        if (regRows && regRows.length > 0) {
            const couponIds = [...new Set(regRows.map((r: any) => r.coupon_id as string))]
            const { error: updateErr } = await supabase
                .from('coupons')
                .update({ wallet_message: message })
                .in('id', couponIds)
            if (updateErr) {
                console.error('wallet-push: failed to update wallet_message', updateErr.message)
            } else {
                console.log(`wallet-push: wrote message to ${couponIds.length} coupons`)
            }
        }

        // ── Step 2: Send APNS push signals ──────────────────────────────────
        const cert = Buffer.from(certBase64, 'base64').toString('utf8')
        const key = Buffer.from(keyBase64, 'base64').toString('utf8')

        let successCount = 0
        let failCount = 0
        const errors: string[] = []

        // Open one HTTP/2 session to APNS (Apple requires HTTP/2)
        const sessionResult = await new Promise<{
            session?: http2.ClientHttp2Session
            error?: string
        }>((resolve) => {
            try {
                const session = http2.connect('https://api.push.apple.com', {
                    cert,
                    key,
                    passphrase: keyPassword,
                    rejectUnauthorized: true,
                })
                session.on('connect', () => resolve({ session }))
                session.on('error', (err) => resolve({ error: err.message }))
                setTimeout(() => resolve({ error: 'Connection timeout' }), 10000)
            } catch (e: any) {
                resolve({ error: e.message })
            }
        })

        if (!sessionResult.session) {
            return NextResponse.json({
                success: false,
                error: `无法连接 APNS: ${sessionResult.error}`,
            }, { status: 500 })
        }

        const session = sessionResult.session

        for (const token of pushTokens) {
            const result = await sendOneRequest(session, token, passTypeId)
            if (result.success) {
                successCount++
            } else {
                failCount++
                errors.push(result.error || 'unknown')
            }
        }

        session.close()

        return NextResponse.json({
            success: true,
            total: pushTokens.length,
            successCount,
            failCount,
            errors: errors.slice(0, 5),
        })
    } catch (err: any) {
        console.error('wallet-push error:', err)
        return NextResponse.json({ success: false, error: err.message || '内部错误' }, { status: 500 })
    }
}

function sendOneRequest(
    session: http2.ClientHttp2Session,
    pushToken: string,
    passTypeId: string
): Promise<{ success: boolean; status?: number; error?: string }> {
    return new Promise((resolve) => {
        try {
            // PassKit background push: empty payload — tells device to refresh the pass
            const payload = '{}'
            const req = session.request({
                ':method': 'POST',
                ':path': `/3/device/${pushToken}`,
                ':scheme': 'https',
                ':authority': 'api.push.apple.com',
                'apns-topic': passTypeId,
                'apns-push-type': 'background',
                'apns-priority': '5',
                'content-type': 'application/json',
                'content-length': String(Buffer.byteLength(payload)),
            })

            req.write(payload)
            req.end()

            let status = 0
            let data = ''

            req.on('response', (headers) => {
                status = headers[':status'] as number
            })
            req.on('data', (chunk) => { data += chunk })
            req.on('end', () => {
                if (status === 200 || status === 201) {
                    resolve({ success: true, status })
                } else {
                    resolve({ success: false, status, error: `HTTP ${status}: ${data}` })
                }
            })
            req.on('error', (e) => resolve({ success: false, error: e.message }))

            setTimeout(() => {
                try { req.close() } catch (_) {}
                resolve({ success: false, error: 'Request timeout' })
            }, 8000)
        } catch (e: any) {
            resolve({ success: false, error: e.message })
        }
    })
}
