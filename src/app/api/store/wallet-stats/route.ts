import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const merchantId = searchParams.get("merchantId");

        if (!merchantId) {
            return NextResponse.json({ success: false, error: "Missing merchantId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Get all wallet registrations for coupons belonging to this merchant
        // Join: wallet_registrations → coupons (inner join on merchant_id) → users (for name/phone)
        const { data: registrations, error } = await supabase
            .from("wallet_registrations")
            .select(`
                id,
                push_token,
                coupon_id,
                device_id,
                coupons!inner (
                    id,
                    code,
                    merchant_id,
                    users (
                        name,
                        phone,
                        email
                    )
                )
            `)
            .eq("coupons.merchant_id", merchantId);

        if (error) {
            console.error("wallet-stats error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        // De-duplicate by push_token (same device may re-register multiple times)
        const seen = new Set<string>();
        const customers: { registrationId: string; pushToken: string; couponId: string; customerName: string; customerEmail: string | null; couponCode: string | null }[] = [];
        for (const r of (registrations || [])) {
            const coupon = (r as any).coupons;
            if (!coupon) continue;
            const token = r.push_token;
            if (seen.has(token)) continue;
            seen.add(token);
            customers.push({
                registrationId: r.id,
                pushToken: token,
                couponId: r.coupon_id,
                customerName: coupon.users?.name || coupon.users?.phone || "Unknown",
                customerEmail: coupon.users?.email || null,
                couponCode: coupon.code || null,
            });
        }

        return NextResponse.json({ success: true, count: customers.length, customers });
    } catch (e: any) {
        console.error("wallet-stats unhandled error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
