'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMerchantSession } from '@/lib/merchant-auth'

export interface MerchantAnalytics {
    totalViews: number
    totalClaims: number
    totalRedemptions: number
    conversionRate: string
    merchantName: string
    merchantSlug: string
}

/**
 * Get analytics for the currently logged-in merchant
 */
export async function getMerchantAnalytics(): Promise<{
    success: boolean
    data?: MerchantAnalytics
    error?: string
}> {
    try {
        // 1. Verify merchant is logged in
        const session = await getMerchantSession()
        if (!session || !session.merchants) {
            return {
                success: false,
                error: '未登录，请先登录商家账号'
            }
        }

        const merchant = session.merchants
        const merchantId = merchant.id
        const supabase = createAdminClient()

        // 2. Query analytics data in parallel
        const [
            { count: totalViews },
            { count: totalClaims },
            { count: totalRedemptions }
        ] = await Promise.all([
            // Total page views
            supabase
                .from('page_views')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', merchantId),

            // Total coupon claims
            supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', merchantId),

            // Total redemptions
            supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', merchantId)
                .eq('status', 'redeemed')
        ])

        // 3. Calculate conversion rate
        const views = totalViews || 0
        const claims = totalClaims || 0
        const redemptions = totalRedemptions || 0

        const conversionRate = views > 0
            ? ((claims / views) * 100).toFixed(2)
            : '0.00'

        return {
            success: true,
            data: {
                totalViews: views,
                totalClaims: claims,
                totalRedemptions: redemptions,
                conversionRate,
                merchantName: merchant.name,
                merchantSlug: merchant.slug
            }
        }
    } catch (error) {
        console.error('Error fetching merchant analytics:', error)
        return {
            success: false,
            error: '获取统计数据失败，请稍后重试'
        }
    }
}
