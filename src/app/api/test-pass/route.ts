import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "test-boston-001",
            name: "Coupon Test",
            offerText: "$10 OFF",
            latitude: 42.3398067,
            longitude: -71.0891717,
            address: "456 College Ave, Boston, MA",
            expirationDate: new Date("2026-02-14"),
            primaryColor: "rgb(99, 0, 0)",
            logoText: " ",
            relevantText: "You're near Coupon Test! Use your $10 OFF 🎉"
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
                "X-Debug-Version": "lock-v7-final",
                "X-Debug-Time": new Date().toISOString()
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
