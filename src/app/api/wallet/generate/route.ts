import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const couponCode = searchParams.get('code');
    return handlePassGeneration(couponCode);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        return handlePassGeneration(body.couponCode);
    } catch (e) {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
}

async function handlePassGeneration(couponCode: string | null) {
    try {
        if (!couponCode) {
            return NextResponse.json({ error: "Missing coupon code" }, { status: 400 });
        }

        const supabase = createAdminClient();

        // Fetch coupon with merchant and user details
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select(`
                id,
                code,
                expires_at,
                authentication_token,
                merchant:merchants (
                    id,
                    name,
                    content,
                    logo_url,
                    latitude,
                    longitude
                ),
                user:users (
                    id,
                    name
                )
            `)
            .eq('code', couponCode)
            .single();

        if (error || !coupon) {
            console.error("Coupon lookup error:", error);
            return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        }

        let authenticationToken = coupon.authentication_token;
        if (!authenticationToken) {
            authenticationToken = crypto.randomUUID();
            await supabase
                .from('coupons')
                .update({ authentication_token: authenticationToken })
                .eq('id', coupon.id);
        }

        const merchant = coupon.merchant as any;
        const user = coupon.user as any;

        // Extract metadata from content JSONB if available
        const offerText = merchant.content?.offer?.text || merchant.content?.offer?.value || "Special Offer";

        // Handle coordinates: prioritize new columns, then content JSONB, then undefined
        const lat = merchant.latitude || merchant.content?.location?.lat || merchant.content?.latitude;
        const lng = merchant.longitude || merchant.content?.location?.lng || merchant.content?.longitude;

        const merchantData: MerchantData = {
            merchantId: merchant.id,
            name: merchant.name,
            offerText: offerText,
            latitude: lat ? parseFloat(lat) : undefined,
            longitude: lng ? parseFloat(lng) : undefined,
            address: merchant.content?.address?.fullAddress || merchant.content?.address || "",
            expirationDate: new Date(coupon.expires_at),
            primaryColor: merchant.content?.brand?.primaryColor || "rgb(99, 0, 0)", // Wine Red
            logoText: "", // Removed text next to logo
        };

        const userData: UserData = {
            userId: user.id,
            userName: user.name || "Customer",
        };

        const passBuffer = await WalletService.generatePass(merchantData, userData, coupon.code);

        return new NextResponse(passBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": `attachment; filename=coupon-${couponCode}.pkpass`,
            },
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to generate pass" }, { status: 500 });
    }
}
