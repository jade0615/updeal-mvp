
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Get simple stats for the merchant terminal
 * Requires merchantSlug in query param for now (simplified for MVP)
 * Ideal world: verify session/pin, but slug is public info anyway so stats leak risk is low.
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
        return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 })
    }

    const supabase = createAdminClient()

    try {
        // 1. Get Merchant ID
        const { data: merchant, error: merchantError } = await supabase
            .from('merchants')
            .select('id')
            .eq('slug', slug)
            .single()

        if (merchantError || !merchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 })
        }

        // 2. Get Today's Redemptions
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const { count: todayCount, error: todayError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)
            .eq('status', 'redeemed')
            .gte('redeemed_at', today.toISOString()) // Filter by redeemed time

        // 3. Get Total Redemptions
        const { count: totalCount, error: totalError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)
            .eq('status', 'redeemed')

        // 4. Get Total Claims (Real Claims)
        const { count: claimsCount, error: claimsError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)

        if (todayError || totalError || claimsError) {
            console.error('Error fetching stats', todayError, totalError, claimsError)
            return NextResponse.json({ success: false, error: 'Failed to fetch stats' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            stats: {
                todayRedemptions: todayCount || 0,
                totalRedemptions: totalCount || 0,
                totalClaims: claimsCount || 0
            }
        })

    } catch (error) {
        console.error('Stats API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
