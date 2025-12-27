'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface CustomerData {
    id: string
    user_id: string
    phone: string
    name: string | null
    internal_id: string | null
    auto_id: string // 自动生成的编号 CUS-0001
    merchant_id: string
    merchant_name: string
    merchant_internal_id: string | null
    coupon_code: string
    claimed_at: string
}

export interface MerchantStats {
    id: string
    name: string
    internal_id: string | null
    customer_count: number
}

// 获取各商家的客户统计
export async function getMerchantCustomerStats(): Promise<MerchantStats[]> {
    const supabase = createAdminClient()

    // 获取所有商家
    const { data: merchants } = await supabase
        .from('merchants')
        .select('id, name, internal_id')
        .order('name')

    if (!merchants) return []

    // 获取每个商家的客户数量
    const stats = await Promise.all(
        merchants.map(async (merchant) => {
            const { count } = await supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', merchant.id)

            return {
                id: merchant.id,
                name: merchant.name,
                internal_id: merchant.internal_id,
                customer_count: count || 0
            }
        })
    )

    // 按客户数量排序（多的在前）
    return stats.sort((a, b) => b.customer_count - a.customer_count)
}

export interface CustomerQuery {
    page?: number
    limit?: number
    sortField?: string
    sortDir?: 'asc' | 'desc'
    search?: string
    filters?: {
        phone?: string
        name?: string
        merchantId?: string
        coupon?: string
    }
}

export async function getCustomers(query: CustomerQuery) {
    const supabase = createAdminClient()

    const page = query.page || 1
    const limit = query.limit || 50
    const offset = (page - 1) * limit

    try {
        let dbQuery = supabase
            .from('coupons')
            .select(`
        id,
        code,
        created_at,
        user_id,
        merchant_id,
        users!inner (
          id,
          phone,
          name,
          internal_id
        ),
        merchants!inner (
          id,
          name,
          internal_id
        )
      `, { count: 'exact' })

        // Global Search
        if (query.search) {
            const s = `%${query.search}%`
            // Note: searching across relationships in Supabase/PostgREST usually requires 
            // specific syntax or separate filters. For simplicity and performance, 
            // we will filter on the main fields we can easily reach or use specific column filters.
            // A true "OR" across tables is complex in PostgREST. 
            // We will prioritize searching Phone OR Coupon OR Merchant Name.
            // However, nested ORs are tricky. Let's try to stick to basic filters first or 
            // imply searching on specific columns if the user uses the global bar.
            // For MVP robustness, let's strictly implement the Column Filters first, 
            // and for Global Search, we might map it to Phone or Coupon if it looks like one.

            // Actually, let's try a best-effort text search on the top-level searchable fields
            // or just rely on the specific column filters as the primary power tool.
            // But the user asked for Global Search. 
            // We can search 'code' (coupon) easily. 
            // 'users.phone' requires the !inner join which we added.
            // We will stick to column matching for now to ensure correctness, 
            // or applying the global search string to multiple fields if simpler syntax allows.
            // supabase-js v2 doesn't easily support "OR across tables".
            // Strategy: If global search is present, we filter 'code' OR 'users.phone'.
            // But 'or' with embedded resources is hard.
            // Let's implement the specific filters first as they are more reliable.
        }

        // Specific Filters
        if (query.filters?.merchantId) {
            dbQuery = dbQuery.eq('merchant_id', query.filters.merchantId)
        }
        if (query.filters?.coupon) {
            dbQuery = dbQuery.ilike('code', `%${query.filters.coupon}%`)
        }

        // For related tables, we need to apply filters on the inner join
        // This often requires modifying the select string or using specific filter syntax
        // The '!inner' in select forces an inner join, allowing us to filter on the related table.
        // However, the .eq() or .ilike() usually applies to the main table.
        // Filtering on 'users.phone' via top level is: .ilike('users.phone', ...)

        if (query.filters?.phone) {
            dbQuery = dbQuery.ilike('users.phone', `%${query.filters.phone}%`)
        }
        if (query.filters?.name) {
            dbQuery = dbQuery.ilike('users.name', `%${query.filters.name}%`)
        }

        // Global Search (Best Effort - Phone or Coupon)
        if (query.search) {
            // We can't easily do "OR" across tables. 
            // We will check if it looks like a phone number.
            if (query.search.match(/^[0-9+() -]+$/)) {
                dbQuery = dbQuery.ilike('users.phone', `%${query.search}%`)
            } else {
                // Assume coupon code or merchant name
                // For now, let's just search coupon code to keep it verified working
                dbQuery = dbQuery.ilike('code', `%${query.search}%`)
            }
        }

        // Sorting
        // Default: created_at desc
        // Sorting by related columns (e.g. merchants.name) is supported in newer PostgREST 
        // but can be syntax-heavy. Let's support main table sorts first.
        if (query.sortField) {
            if (query.sortField === 'claimed_at') {
                dbQuery = dbQuery.order('created_at', { ascending: query.sortDir === 'asc' })
            } else if (query.sortField === 'coupon_code') {
                dbQuery = dbQuery.order('code', { ascending: query.sortDir === 'asc' })
            } else if (query.sortField === 'merchant_name') {
                // Sort by foreign key is tricky, usually requires reference in order()
                // dbQuery = dbQuery.order('merchants(name)', ...)
                try {
                    dbQuery = dbQuery.order('merchants(name)', { ascending: query.sortDir === 'asc' })
                } catch (e) {
                    // Fallback to default
                    dbQuery = dbQuery.order('created_at', { ascending: false })
                }
            } else {
                dbQuery = dbQuery.order('created_at', { ascending: false })
            }
        } else {
            dbQuery = dbQuery.order('created_at', { ascending: false })
        }

        dbQuery = dbQuery.range(offset, offset + limit - 1)

        const { data, error, count } = await dbQuery

        if (error) {
            console.error('Error fetching customers:', error)
            return { success: false, error: 'Failed to fetch data' }
        }

        // Flatten data with auto-generated IDs
        const customers: CustomerData[] = data.map((item: any, index: number) => {
            // 生成自动编号: CUS-0001 格式
            // 使用全局排序位置 + offset 来确保编号连续
            const autoIdNum = offset + index + 1
            const autoId = `CUS-${String(autoIdNum).padStart(4, '0')}`

            return {
                id: item.id,
                user_id: item.user_id || item.users?.id,
                phone: item.users?.phone || 'Unknown',
                name: item.users?.name || '-',
                internal_id: item.users?.internal_id || null,
                auto_id: autoId,
                merchant_id: item.merchant_id || item.merchants?.id,
                merchant_name: item.merchants?.name || 'Unknown',
                merchant_internal_id: item.merchants?.internal_id || null,
                coupon_code: item.code,
                claimed_at: new Date(item.created_at).toLocaleString('zh-CN'),
            }
        })

        return { success: true, customers, total: count }
    } catch (err) {
        console.error('Server Action Error:', err)
        return { success: false, error: 'Internal Server Error' }
    }
}
