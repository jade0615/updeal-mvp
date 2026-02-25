import { NextResponse } from 'next/server'
import { getMerchantSession } from '@/lib/merchant-auth'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * GET /api/store/merchant-info
 * Returns the logged-in merchant's slug and timezone.
 * Used by the SMS page to populate schedule-message API params.
 */
export async function GET() {
    try {
        const session = await getMerchantSession()
        if (!session?.merchants) {
            return NextResponse.json({ error: '未登录' }, { status: 401 })
        }

        const merchant = session.merchants
        const supabase = createAdminClient()

        const { data } = await supabase
            .from('merchants')
            .select('slug, timezone')
            .eq('id', merchant.id)
            .single()

        return NextResponse.json({
            id: merchant.id,
            slug: data?.slug || '',
            timezone: data?.timezone || 'America/New_York',
        })
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
