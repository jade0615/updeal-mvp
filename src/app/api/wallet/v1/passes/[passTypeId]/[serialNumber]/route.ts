import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Apple Wallet Web Service: Pass Update
 * GET /v1/passes/{passTypeId}/{serialNumber}
 */

interface Params {
    passTypeId: string;
    serialNumber: string;
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<Params> }
) {
    try {
        const { serialNumber } = await params;

        // Verify Authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("ApplePass ")) {
            return new NextResponse(null, { status: 401 });
        }
        const authToken = authHeader.replace("ApplePass ", "");

        const supabase = createAdminClient();

        // 1. Fetch coupon with merchant and user details
        const { data: coupon, error } = await supabase
            .from('coupons')
            .select(`
                id,
                code,
                expires_at,
                authentication_token,
                wallet_message,
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
            .eq('code', serialNumber)
            .single();

        if (error || !coupon) {
            return new NextResponse(null, { status: 404 });
        }

        // 2. Verify Authentication Token
        if (coupon.authentication_token !== authToken) {
            return new NextResponse(null, { status: 401 });
        }

        const merchant = coupon.merchant as any;
        const user = coupon.user as any;

        const offerText = merchant.content?.offer?.text || merchant.content?.offer?.value || "Special Offer";
        const lat = merchant.latitude || merchant.content?.location?.lat || merchant.content?.latitude;
        const lng = merchant.longitude || merchant.content?.location?.lng || merchant.content?.longitude;

        const merchantData: MerchantData = {
            merchantId: merchant.id,
            name: merchant.name,
            offerText: offerText,
            latitude: lat ? parseFloat(lat) : undefined,
            longitude: lng ? parseFloat(lng) : undefined,
            expirationDate: new Date(coupon.expires_at),
            primaryColor: merchant.content?.brand?.primaryColor || "rgb(99, 0, 0)",
            logoText: " ",
            walletMessage: coupon.wallet_message || undefined,
        };

        const userData: UserData = {
            userId: user.id,
            userName: user.name || "Customer",
        };

        // 3. Generate the pass
        // Pass the authenticationToken as well to ensure it's embedded in the updated pass
        const passBuffer = await WalletService.generatePass(merchantData, userData, coupon.authentication_token);

        return new NextResponse(passBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Last-Modified": new Date((coupon as any).updated_at || Date.now()).toUTCString(),
            },
        });

    } catch (error) {
        console.error("WWS Pass Update Error:", error);
        return new NextResponse(null, { status: 500 });
    }
}
