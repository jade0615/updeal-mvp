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

        // Count Wallet Registrations mapped to this merchant's coupons
        const { data: coupons } = await supabase
            .from("coupons")
            .select("id")
            .eq("merchant_id", merchantId);

        if (!coupons || coupons.length === 0) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const couponIds = coupons.map((c: any) => c.id);

        const { count, error } = await supabase
            .from("wallet_registrations")
            .select("*", { count: "exact", head: true })
            .in("coupon_id", couponIds);

        if (error) {
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, count: count || 0 });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
