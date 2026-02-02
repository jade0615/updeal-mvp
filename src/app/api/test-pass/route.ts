import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "test-merchant-001",
            name: "HiRaccoon Test Store",
            offerText: "FREE COFFEE",
            latitude: 1.287953,
            longitude: 103.851784,
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            primaryColor: "rgb(212, 175, 55)", // Metallic Gold
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
