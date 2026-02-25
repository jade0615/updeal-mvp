import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const merchantId = searchParams.get('merchantId')
        const merchantSlug = searchParams.get('merchantSlug')

        if (!merchantId || !merchantSlug) {
            return NextResponse.json({ error: '缺少参数' }, { status: 400 })
        }

        const supabase = createAdminClient()

        // Verify merchant
        const { data: merchant } = await supabase
            .from('merchants')
            .select('id')
            .eq('id', merchantId)
            .eq('slug', merchantSlug)
            .single()

        if (!merchant) {
            return NextResponse.json({ error: '验证失败' }, { status: 403 })
        }

        // Fetch actual send logs
        let logs: any[] = []
        const { data: smsLogData, error: smsLogError } = await supabase
            .from('sms_logs')
            .select('*')
            .eq('merchant_id', merchantId)
            .order('sent_at', { ascending: false })
            .limit(100)

        if (!smsLogError && smsLogData) {
            logs = smsLogData
        }

        // Fetch pending/scheduled SMS tasks from scheduled_messages
        let scheduledEntries: any[] = []
        try {
            const { data: tasks } = await supabase
                .from('scheduled_messages')
                .select('*')
                .eq('merchant_id', merchantId)
                .eq('type', 'sms')
                .in('status', ['pending', 'processing'])
                .order('scheduled_at', { ascending: false })

            if (tasks && tasks.length > 0) {
                for (const task of tasks) {
                    const recipients = task.recipients || []
                    for (const r of recipients) {
                        scheduledEntries.push({
                            id: `scheduled-${task.id}-${r.phone}`,
                            merchant_id: merchantId,
                            recipient_phone: r.phone,
                            recipient_name: r.name || null,
                            message: task.body || '',
                            status: 'scheduled',
                            error_message: null,
                            campaign_name: null,
                            sent_at: task.scheduled_at,
                            scheduled_at: task.scheduled_at,
                        })
                    }
                }
            }
        } catch { /* scheduled_messages table might not exist */ }

        // Merge: scheduled entries first, then actual logs
        const allLogs = [...scheduledEntries, ...logs]

        const stats = {
            total: logs.length,
            success: logs.filter((l: any) => l.status === 'success').length,
            scheduled: scheduledEntries.length,
        }

        return NextResponse.json({ success: true, logs: allLogs, stats })
    } catch (err: any) {
        console.error('SMS logs error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
