
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { WalletService } from '../src/lib/wallet/WalletService';

async function debug() {
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const couponCode = 'BUND-TSLE';

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
        console.error("Coupon not found", error);
        return;
    }

    const merchant = coupon.merchant as any;
    const user = coupon.user as any;

    const offerText = merchant.content?.offer?.text || merchant.content?.offer?.value || "Special Offer";
    const lat = merchant.latitude || merchant.content?.location?.lat || merchant.content?.latitude;
    const lng = merchant.longitude || merchant.content?.location?.lng || merchant.content?.longitude;

    const merchantData = {
        merchantId: merchant.id,
        name: merchant.name,
        offerText: offerText,
        latitude: lat ? parseFloat(lat) : undefined,
        longitude: lng ? parseFloat(lng) : undefined,
        address: merchant.content?.address?.fullAddress || merchant.content?.address || "",
        expirationDate: new Date(coupon.expires_at),
        primaryColor: merchant.content?.brand?.primaryColor || "rgb(255, 184, 0)",
        logoText: merchant.name,
    };

    const userData = {
        userId: user.id,
        userName: user.name || "Customer",
    };

    try {
        console.log("Attempting to generate pass...");
        await WalletService.generatePass(merchantData, userData, coupon.authentication_token);
        console.log("Success!");
    } catch (err) {
        console.error("GENERATION FAILED:", err);
    }
}

debug();
