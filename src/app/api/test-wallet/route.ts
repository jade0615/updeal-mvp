
import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "simple-test-001",
            name: "Simple Test Store",
            offerText: "Simple Test Offer",
            latitude: 40.7616455,
            longitude: -73.8165652,
            address: "147-40 41st Ave, Flushing, NY 11355",
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            primaryColor: "rgb(0, 0, 0)",
            logoText: "Test",
            relevantText: "Ping! You're near the test store."
        };

        const userData: UserData = {
            userId: "simple-user",
            userName: "Simple User",
        };

        const passBuffer = await WalletService.generatePass(merchantData, userData);

        return new NextResponse(passBuffer as any, {
            status: 200,
            headers: {
                "Content-Type": "application/vnd.apple.pkpass",
                "Content-Disposition": 'attachment; filename="simple-test.pkpass"',
            },
        });
    } catch (error: any) {
        console.error("Simple Test API Error:", error);
        return NextResponse.json({
            error: "Failed to generate simple pass",
            details: error.message
        }, { status: 500 });
    }
}
