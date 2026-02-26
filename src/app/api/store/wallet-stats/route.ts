import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const merchantId = searchParams.get("merchantId");

        if (!merchantId) {
            return NextResponse.json({ success: false, error: "Missing merchantId" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Get all coupons for this merchant
        const { data: coupons } = await supabase
            .from("coupons")
            .select("id, customer_name")
            .eq("merchant_id", merchantId);

        if (!coupons || coupons.length === 0) {
            return NextResponse.json({ success: true, count: 0, customers: [] });
        }

        const couponIds = coupons.map((c: any) => c.id);
        const couponMap = Object.fromEntries(coupons.map((c: any) => [c.id, c.customer_name]));

        // Get all wallet registrations for those coupons
        const { data: registrations, error } = await supabase
            .from("wallet_registrations")
            .select("id, push_token, coupon_id")
            .in("coupon_id", couponIds);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        const customers = (registrations || []).map((r: any) => ({
            registrationId: r.id,
            pushToken: r.push_token,
            couponId: r.coupon_id,
            customerName: couponMap[r.coupon_id] || "Unknown",
        }));

        return NextResponse.json({ success: true, count: customers.length, customers });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

