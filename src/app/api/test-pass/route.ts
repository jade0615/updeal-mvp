import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "test-ny-001",
            name: "New York Store Test",
            offerText: "🎁 NY Store Coupon ☕",
            latitude: 40.7616455,
            longitude: -73.8165652,
            address: "147-40 41st Ave, Flushing, NY 11355",
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            primaryColor: "rgb(255, 184, 0)",
            logoText: "NY Store",
            relevantText: "You're near the store! Show your coupon for $10 OFF 🎉"
        };

        const userData: UserData = {
            userId: "test-user-999",
            userName: "Test User",
        };

        const passBuffer = await WalletService.generatePass(merchantData, userData);

        return new NextResponse(passBuffer as any, {
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
