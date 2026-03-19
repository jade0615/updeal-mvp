import type { SupabaseClient } from '@supabase/supabase-js'

/** 合并后的单条记录（含仍待发送的定时任务展开行） */
export interface MergedSmsLogRow {
    id: string
    merchant_id: string | null
    recipient_phone: string
    recipient_name: string | null
    message: string
    status: 'success' | 'failed' | 'scheduled'
    error_message: string | null
    campaign_name: string | null
    sent_at: string
    scheduled_at?: string | null
    created_at?: string | null
}

export interface MergedSmsLogStats {
    /** 列表总行数 = 最近日志 + 待发送展开行 */
    total: number
    /** 已成功发出（含「立即发送」与「定时任务」执行后写入 sms_logs 的） */
    success: number
    failed: number
    /** 仍排队 / 发送中的定时短信（尚未写入 sms_logs） */
    scheduled: number
    /** 本次拉取的 sms_logs 条数（≤ limit），均为已有结果的发送 */
    sentRecords: number
}

/**
 * 拉取 sms_logs 并与未完成的定时短信任务合并。
 * 顺序：先发后排队——真实发送记录在前，待定时在后，便于「成功」记录立刻可见。
 */
export async function fetchMergedSmsLogsForMerchant(
    supabase: SupabaseClient,
    merchantId: string,
    logLimit = 100
): Promise<{ logs: MergedSmsLogRow[]; stats: MergedSmsLogStats }> {
    let logs: MergedSmsLogRow[] = []
    const { data: smsLogData, error: smsLogError } = await supabase
        .from('sms_logs')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('sent_at', { ascending: false })
        .limit(logLimit)

    if (!smsLogError && smsLogData) {
        logs = smsLogData.map((l: any) => ({
            ...l,
            status: l.status as 'success' | 'failed',
        }))
    }

    let scheduledEntries: MergedSmsLogRow[] = []
    try {
        const { data: tasks } = await supabase
            .from('scheduled_messages')
            .select('*')
            .eq('merchant_id', merchantId)
            .eq('type', 'sms')
            .in('status', ['pending', 'processing', 'sending'])
            .order('scheduled_at', { ascending: false })

        if (tasks && tasks.length > 0) {
            for (const task of tasks) {
                const recipients = (task as any).recipients || []
                for (const r of recipients) {
                    scheduledEntries.push({
                        id: `scheduled-${task.id}-${r.phone}`,
                        merchant_id: merchantId,
                        recipient_phone: r.phone,
                        recipient_name: r.name || null,
                        message: (task as any).body || '',
                        status: 'scheduled',
                        error_message: null,
                        campaign_name: null,
                        sent_at: (task as any).scheduled_at,
                        scheduled_at: (task as any).scheduled_at,
                    })
                }
            }
        }
    } catch {
        /* scheduled_messages 可能不存在 */
    }

    const success = logs.filter((l) => l.status === 'success').length
    const failed = logs.filter((l) => l.status === 'failed').length
    const scheduled = scheduledEntries.length
    const mergedLogs = [...logs, ...scheduledEntries]

    return {
        logs: mergedLogs,
        stats: {
            total: mergedLogs.length,
            success,
            failed,
            scheduled,
            sentRecords: logs.length,
        },
    }
}
