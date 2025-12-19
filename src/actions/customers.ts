'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface CustomerData {
    id: string
    phone: string
    name: string | null
    merchant_name: string
    coupon_code: string
    claimed_at: string
}

export async function getCustomers(limit = 100, offset = 0, merchantId?: string) {
    const supabase = createAdminClient()

    try {
        // Build base query
        let query = supabase
            .from('coupons')
            .select(`
                id,
                code,
                created_at,
                users (
                    phone,
                    name
                ),
                merchants (
                    name
                )
            `, { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1)

        // Apply merchant filter if present
        if (merchantId) {
            query = query.eq('merchant_id', merchantId)
        }

        const { data, error, count } = await query

        if (error) {
            console.error('Error fetching customers:', error)
            return { success: false, error: 'Failed to fetch data' }
        }

        // Flatten data for the UI
        const customers: CustomerData[] = data.map((item: any) => ({
            id: item.id,
            phone: item.users?.phone || 'Unknown',
            name: item.users?.name || '-',
            merchant_name: item.merchants?.name || 'Unknown',
            coupon_code: item.code,
            claimed_at: new Date(item.created_at).toLocaleString('zh-CN'),
        }))

        return { success: true, customers, total: count }
    } catch (err) {
        console.error('Server Action Error:', err)
        return { success: false, error: 'Internal Server Error' }
    }
}
