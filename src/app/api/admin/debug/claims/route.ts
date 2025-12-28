import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { validateSession } from '@/lib/auth/session';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get('updeal_admin_session')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const user = await validateSession(token);
        if (!user) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }
    } catch {
        return NextResponse.json({ error: 'Session error' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    // Get merchant by slug if provided
    let merchantFilter = {};
    if (slug) {
        const { data: merchant } = await supabase
            .from('merchants')
            .select('id, name, slug')
            .ilike('slug', `%${slug}%`)
            .limit(10);

        if (!merchant || merchant.length === 0) {
            return NextResponse.json({
                error: 'No merchant found with this slug',
                searched_slug: slug
            }, { status: 404 });
        }

        // Get stats and claims for each matching merchant
        const results = await Promise.all(merchant.map(async (m) => {
            // Get landing page stats
            const { data: stats } = await supabase
                .from('landing_page_stats')
                .select('*')
                .eq('merchant_id', m.id)
                .single();

            // Get actual coupons count
            const { count: couponCount } = await supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', m.id);

            // Get actual coupons with user data
            const { data: coupons } = await supabase
                .from('coupons')
                .select(`
                    id,
                    code,
                    created_at,
                    users (
                        phone,
                        name
                    )
                `)
                .eq('merchant_id', m.id)
                .order('created_at', { ascending: false })
                .limit(50);

            return {
                merchant: {
                    id: m.id,
                    name: m.name,
                    slug: m.slug
                },
                stats: stats || { error: 'No stats record found' },
                actual_coupon_count: couponCount || 0,
                coupons: coupons || []
            };
        }));

        return NextResponse.json({ results });
    }

    // Return all merchants with stats
    const { data: allMerchants } = await supabase
        .from('merchants')
        .select(`
            id,
            name,
            slug,
            landing_page_stats (
                total_page_views,
                total_coupon_claims,
                conversion_rate
            )
        `)
        .order('created_at', { ascending: false });

    // Get actual coupon counts
    const merchantsWithActualCounts = await Promise.all(
        (allMerchants || []).map(async (m: any) => {
            const { count } = await supabase
                .from('coupons')
                .select('*', { count: 'exact', head: true })
                .eq('merchant_id', m.id);

            return {
                ...m,
                actual_coupon_count: count || 0,
                stats_coupon_claims: m.landing_page_stats?.[0]?.total_coupon_claims || 0,
                data_mismatch: count !== (m.landing_page_stats?.[0]?.total_coupon_claims || 0)
            };
        })
    );

    return NextResponse.json({
        merchants: merchantsWithActualCounts
    });
}
