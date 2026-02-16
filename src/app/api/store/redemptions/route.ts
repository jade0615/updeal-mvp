
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
        // Fetch last 100 redeemed coupons, joined with merchant and user data
        const { data: coupons, error: couponsError } = await supabase
            .from('coupons')
            .select(`
                code,
                redeemed_at,
                merchants (
                    content
                ),
                users (
                    name,
                    phone,
                    email
                )
            `)
            .eq('merchant_id', merchant.id)
            .eq('status', 'redeemed')
            .order('redeemed_at', { ascending: false })
            .limit(100)

        if (couponsError) {
            console.error('Error fetching redemptions', couponsError)
            return NextResponse.json({ success: false, error: 'Failed to fetch redemptions' }, { status: 500 })
        }

        // Format data for frontend
        const formattedRedemptions = (coupons || []).map((c: any) => {
            const m = c.merchants as any
            const u = c.users as any

            // Extract offer title from merchant content
            const offerTitle = m?.content?.offer?.value ||
                m?.content?.offerDiscount ||
                m?.content?.offer_value ||
                '优惠券'

            return {
                code: c.code,
                offer_name: offerTitle,
                redeemed_at: c.redeemed_at,
                customer_name: u?.name || '-',
                customer_phone: u?.phone || '-',
                customer_email: u?.email || '-'
            }
        })

        return NextResponse.json({
            success: true,
            redemptions: formattedRedemptions
        })

    } catch (error) {
        console.error('Redemptions API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
