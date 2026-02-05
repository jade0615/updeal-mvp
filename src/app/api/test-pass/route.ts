import { NextRequest, NextResponse } from "next/server";
import { WalletService, MerchantData, UserData } from "@/lib/wallet/WalletService";

export async function GET(req: NextRequest) {
    try {
        const merchantData: MerchantData = {
            merchantId: "test-shanghai-001",
            name: "上海办公室测试",
            offerText: "🎁 上海办测试卡券 ☕",
            latitude: 31.0748,
            longitude: 121.5080,
            address: "上海市闵行区浦江镇浦新公路1601号A栋",
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            primaryColor: "rgb(255, 184, 0)",
            logoText: "上海办",
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
