import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "test-merchant-001",
            name: "HiRaccoon Test Store",
            offerText: "🎁 FREE COFFEE ☕",
            latitude: 40.7589,  // Flushing, NY
            longitude: -73.8297,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            primaryColor: "rgb(255, 184, 0)", // HiRaccoon Gold
            logoText: "HiRaccoon",
        };

        const userData: UserData = {
            userId: "test-user-999",
            userName: "Test User",
        };

        const passBuffer = await WalletService.generatePass(merchantData, userData);

        return new NextResponse(passBuffer, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": 'attachment; filename="test-coupon.pkpass"',
            },
        });
    } catch (error: any) {
        console.error("Test API Error:", error);
        return NextResponse.json({
            error: "Failed to generate test pass",
            details: error.message
        }, { status: 500 });
    }
}
