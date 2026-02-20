'use server';

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

function getServiceClient() {
    return createClient(supabaseUrl, supabaseServiceKey);
}

export interface EmailLog {
    id: string;
    merchant_id: string | null;
    recipient_email: string;
    recipient_name: string | null;
    subject: string;
    template_name: string;
    html_content: string | null;
    status: 'success' | 'failed';
    error_message: string | null;
    campaign_name: string | null;
    sent_at: string;
    created_at: string;
    // Joined
    merchant_name?: string;
}

export interface EmailLogQuery {
    page?: number;
    limit?: number;
    merchantId?: string;
    status?: 'success' | 'failed' | 'all';
    campaignName?: string;
}

export interface EmailLogStats {
    total: number;
    success: number;
    failed: number;
    successRate: string;
}

/**
 * Fetches email logs with optional filtering and pagination.
 */
export async function getEmailLogs(query: EmailLogQuery = {}): Promise<{
    logs: EmailLog[];
    total: number;
    stats: EmailLogStats;
    success: boolean;
    error?: string;
}> {
    const supabase = getServiceClient();
    const page = query.page || 1;
    const limit = query.limit || 50;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        // Build base query for logs (with merchant join)
        let logsQuery = supabase
            .from('email_logs')
            .select(`
                *,
                merchants(name)
            `, { count: 'exact' })
            .order('sent_at', { ascending: false })
            .range(from, to);

        if (query.merchantId) {
            logsQuery = logsQuery.eq('merchant_id', query.merchantId);
        }
        if (query.status && query.status !== 'all') {
            logsQuery = logsQuery.eq('status', query.status);
        }
        if (query.campaignName) {
            logsQuery = logsQuery.ilike('campaign_name', `%${query.campaignName}%`);
        }

        const { data: logs, error, count } = await logsQuery;

        if (error) throw error;

        // Fetch stats (always across all filters for the selected merchant)
        let statsQuery = supabase
            .from('email_logs')
            .select('status', { count: 'exact', head: false });

        if (query.merchantId) {
            statsQuery = statsQuery.eq('merchant_id', query.merchantId);
        }

        const { data: allStatuses, error: statsError } = await statsQuery;
        if (statsError) throw statsError;

        const total = allStatuses?.length || 0;
        const successCount = allStatuses?.filter(r => r.status === 'success').length || 0;
        const failedCount = allStatuses?.filter(r => r.status === 'failed').length || 0;
        const successRate = total > 0 ? ((successCount / total) * 100).toFixed(1) + '%' : '—';

        const mapped: EmailLog[] = (logs || []).map((log: any) => ({
            ...log,
            merchant_name: log.merchants?.name || null,
            merchants: undefined,
        }));

        return {
            logs: mapped,
            total: count || 0,
            stats: { total, success: successCount, failed: failedCount, successRate },
            success: true,
        };
    } catch (e: any) {
        return { logs: [], total: 0, stats: { total: 0, success: 0, failed: 0, successRate: '—' }, success: false, error: e.message };
    }
}

/**
 * Fetches all distinct campaign names for filter dropdown.
 */
export async function getEmailCampaigns(): Promise<string[]> {
    const supabase = getServiceClient();
    const { data } = await supabase
        .from('email_logs')
        .select('campaign_name')
        .not('campaign_name', 'is', null)
        .order('campaign_name');

    const names = [...new Set((data || []).map((d: any) => d.campaign_name).filter(Boolean))];
    return names;
}
