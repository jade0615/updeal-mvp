'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface WalletDownload {
    id: string
    merchant_slug: string
    customer_name: string | null
    customer_phone: string | null
    customer_email: string | null
    coupon_code: string
    downloaded_at: string
}

export interface WalletDownloadQuery {
    page?: number
    limit?: number
    search?: string
    merchantSlug?: string
}

export interface WalletDownloadsResult {
    success: boolean
    downloads?: WalletDownload[]
    total?: number
    uniqueMerchantSlugs?: string[]
    error?: string
}

export async function getWalletDownloads(query: WalletDownloadQuery) {
    const supabase = createAdminClient()
    const page = query.page || 1
    const limit = query.limit || 50
    const offset = (page - 1) * limit

    try {
        let dbQuery = supabase
            .from('wallet_downloads')
            .select('*', { count: 'exact' })

        if (query.merchantSlug) {
            dbQuery = dbQuery.eq('merchant_slug', query.merchantSlug)
        }

        if (query.search) {
            const s = `%${query.search}%`
            dbQuery = dbQuery.or(`customer_name.ilike.${s},customer_phone.ilike.${s},customer_email.ilike.${s},coupon_code.ilike.${s}`)
        }

        const { data, error, count } = await dbQuery
            .order('downloaded_at', { ascending: false })
            .range(offset, offset + limit - 1)

        if (error) {
            console.error('Error fetching wallet downloads:', error)
            return { success: false, error: 'Failed to fetch data' }
        }

        const { data: uniqueSlugsData } = await supabase
            .from('wallet_downloads')
            .select('merchant_slug')

        const uniqueMerchantSlugs = Array.from(new Set(uniqueSlugsData?.map(d => d.merchant_slug) || []))

        return {
            success: true,
            downloads: data as WalletDownload[],
            total: count || 0,
            uniqueMerchantSlugs
        }
    } catch (err) {
        console.error('getWalletDownloads error:', err)
        return { success: false, error: 'Internal server error' }
    }
}
