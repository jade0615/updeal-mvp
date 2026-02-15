
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

        // 2. Get Claims
        // Fetch last 100 coupons for this merchant, including user data
        const { data: claims, error: claimsError } = await supabase
            .from('coupons')
            .select(`
                code,
                created_at,
                users (
                    name,
                    email,
                    phone
                )
            `)
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: false })
            .limit(100)

        if (claimsError) {
            console.error('Error fetching claims', claimsError)
            return NextResponse.json({ success: false, error: 'Failed to fetch claims' }, { status: 500 })
        }

        // Format data for easier use in frontend
        const formattedClaims = claims.map((c: any) => ({
            code: c.code,
            createdAt: c.created_at,
            customerName: c.users?.name || '未知',
            customerEmail: c.users?.email || '-',
            customerPhone: c.users?.phone || '-'
        }))

        return NextResponse.json({
            success: true,
            claims: formattedClaims
        })

    } catch (error) {
        console.error('Claims API Error:', error)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
