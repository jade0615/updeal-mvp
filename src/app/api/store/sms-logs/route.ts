import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchMergedSmsLogsForMerchant } from '@/lib/sms-logs-merge'

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

        const { logs: allLogs, stats } = await fetchMergedSmsLogsForMerchant(supabase, merchantId, 100)

        return NextResponse.json({ success: true, logs: allLogs, stats })
    } catch (err: any) {
        console.error('SMS logs error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
