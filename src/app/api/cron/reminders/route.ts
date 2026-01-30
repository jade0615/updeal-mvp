import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendT1Reminder, sendT2FinalCall, sendT3NoShow } from '@/lib/email';

export const dynamic = 'force-dynamic';

/**
 * Hourly Cron Job to scan for pending reminders
 * logic:
 * - T1: 24h before expected_visit_date
 * - T2: Today (Morning)
 */
export async function GET(request: NextRequest) {
    // Simple auth check for cron (e.g., CRON_SECRET)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createAdminClient();
    const now = new Date();

    const results = {
        t1_sent: 0,
        t2_sent: 0,
        t3_sent: 0,
        errors: [] as string[]
    };

    try {
        // -------------------------------------------------------------------------
        // 1. Process T1 Reminders (24 Hours Before)
        // -------------------------------------------------------------------------
        const t1Limit = new Date(now.getTime() + 25 * 60 * 60 * 1000); // 24-25 hours from now
        const t1Start = new Date(now.getTime() + 23 * 60 * 60 * 1000);

        const { data: t1Coupons } = await supabase
            .from('coupons')
            .select(`
        *,
        users!inner(email, name),
        merchants!inner(name, content)
      `)
            .eq('email_sent_stage', 1) // Finished T0
            .lt('expected_visit_date', t1Limit.toISOString())
            .gt('expected_visit_date', t1Start.toISOString())
            .eq('status', 'active');

        if (t1Coupons) {
            for (const coupon of t1Coupons) {
                if (coupon.users?.email) {
                    const res = await sendT1Reminder({
                        email: coupon.users.email,
                        merchantName: coupon.merchants.name,
                        couponCode: coupon.code
                    });
                    if (res.success) {
                        await supabase.from('coupons').update({ email_sent_stage: 2 }).eq('id', coupon.id);
                        results.t1_sent++;
                    }
                }
            }
        }

        // -------------------------------------------------------------------------
        // 2. Process T2 Reminders (Day Of / Morning)
        // -------------------------------------------------------------------------
        // Target coupons whose visit date is TODAY between now and end of day
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const { data: t2Coupons } = await supabase
            .from('coupons')
            .select(`
        *,
        users!inner(email, name),
        merchants!inner(name, content)
      `)
            .eq('email_sent_stage', 2) // Finished T1
            .lt('expected_visit_date', endOfDay.toISOString())
            .gt('expected_visit_date', now.toISOString())
            .eq('status', 'active');

        if (t2Coupons) {
            for (const coupon of t2Coupons) {
                if (coupon.users?.email) {
                    const res = await sendT2FinalCall({
                        email: coupon.users.email,
                        merchantName: coupon.merchants.name,
                        couponCode: coupon.code,
                        heroImage: coupon.merchants.content?.hero_image
                    });
                    if (res.success) {
                        await supabase.from('coupons').update({ email_sent_stage: 3 }).eq('id', coupon.id);
                        results.t2_sent++;
                    }
                }
            }
        }

        // -------------------------------------------------------------------------
        // 3. Process T3 No-Show Follow-up (Day After)
        // -------------------------------------------------------------------------
        // Target: Expected yesterday, still active (not redeemed)
        // Time window: Expected date is between 24h and 48h ago (roughly)
        const t3Limit = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24h ago
        const t3Start = new Date(now.getTime() - 50 * 60 * 60 * 1000); // 50h ago

        const { data: t3Coupons } = await supabase
            .from('coupons')
            .select(`
                *,
                users!inner(email, name),
                merchants!inner(name, content)
            `)
            .lt('expected_visit_date', t3Limit.toISOString())
            .gt('expected_visit_date', t3Start.toISOString())
            .eq('status', 'active')
            .lt('email_sent_stage', 4); // Only if not sent T3 yet

        if (t3Coupons) {
            for (const coupon of t3Coupons) {
                if (coupon.users?.email) {
                    const res = await sendT3NoShow({
                        email: coupon.users.email,
                        merchantName: coupon.merchants.name,
                        couponCode: coupon.code,
                    });
                    if (res.success) {
                        await supabase.from('coupons').update({ email_sent_stage: 4 }).eq('id', coupon.id);
                        results.t3_sent++;
                    }
                }
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error('Cron Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
