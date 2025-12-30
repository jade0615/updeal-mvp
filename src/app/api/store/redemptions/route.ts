
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

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

        // 2. Get Redemptions
        // Fetch last 100 redeemed coupons, ordered by redeemed_at desc
        const { data: coupons, error: couponsError } = await supabase
            .from('coupons')
            .select('code, customer_phone, customer_email, customer_name, offer_discount, redeemed_at')
            .eq('merchant_id', merchant.id)
            .eq('status', 'redeemed')
            .order('redeemed_at', { ascending: false })
            .limit(100)

        if (couponsError) {
            console.error('Error fetching redemptions', couponsError)
            return NextResponse.json({ success: false, error: 'Failed to fetch redemptions' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            redemptions: coupons
        })

    } catch (error) {
        console.error('Redemptions API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
