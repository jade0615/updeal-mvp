import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = createAdminClient();

    // 1. Get Merchant
    const { data: merchant, error: merchantError } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', slug)
        .single();

    if (merchantError || !merchant) {
        return NextResponse.json(
            { success: false, error: 'Merchant not found' },
            { status: 404 }
        );
    }

    // 2. Get Stats (Claimed count)
    // We can count rows in coupons table for this merchant
    const { count: claimedCount, error: countError } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', merchant.id);

    // 3. Track View (Optional, can be done via analytics action or here)
    // For now, we just return the data. The frontend calls trackPageView.

    return NextResponse.json({
        success: true,
        merchant: merchant,
        stats: {
            claimedCount: (claimedCount || 0) + (merchant.virtual_base_count || 0),
            realClaimedCount: claimedCount || 0,
            viewCount: 0
        }
    });
}
