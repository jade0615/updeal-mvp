import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

/**
 * Get all customers (claimed coupons) for a merchant
 * Shows: customer info, claim time, status (pending/redeemed/expired)
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
            .select('id, content')
            .eq('slug', slug)
            .single()

        if (merchantError || !merchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 })
        }

        // 2. Get all coupons with user data (JOIN users table)
        const { data: coupons, error: couponsError } = await supabase
            .from('coupons')
            .select(`
                id,
                code,
                status,
                created_at,
                redeemed_at,
                expires_at,
                users!inner (
                    phone,
                    email,
                    name
                )
            `)
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: false })
            .limit(200)

        if (couponsError) {
            console.error('Error fetching customers', couponsError)
            return NextResponse.json({ success: false, error: 'Failed to fetch customers' }, { status: 500 })
        }

        // 3. Process status for display
        const now = new Date()
        const customers = coupons?.map((coupon: any) => {
            let displayStatus = coupon.status

            // Check if expired (for active coupons)
            if (coupon.status === 'active' && coupon.expires_at) {
                const expiresAt = new Date(coupon.expires_at)
                if (expiresAt < now) {
                    displayStatus = 'expired'
                }
            }

            return {
                id: coupon.id,
                code: coupon.code,
                name: coupon.users?.name || '-',
                phone: coupon.users?.phone || '-',
                email: coupon.users?.email || '-',
                status: displayStatus,
                claimedAt: coupon.created_at,
                redeemedAt: coupon.redeemed_at
            }
        }) || []

        return NextResponse.json({
            success: true,
            customers,
            total: customers.length
        })

    } catch (error) {
        console.error('Customers API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
