
import { WalletService, MerchantData, UserData } from "../src/lib/wallet/WalletService";
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

// Mock env variables for local testing
process.env.APPLE_SIGNER_KEY_PASSWORD = "123456";

async function test() {
    console.log("🚀 Running WalletService local test...");
    console.log("📝 WalletService.generatePass exists:", typeof WalletService.generatePass === 'function');
    // console.log("📝 WalletService.generatePass content:", WalletService.generatePass.toString().slice(0, 100));

    const merchantData: MerchantData = {
        merchantId: "test-ny-001",
        name: "New York Store Test",
        offerText: "🎁 NY Store Coupon ☕",
        latitude: 40.7616455,
        longitude: -73.8165652,
        address: "147-40 41st Ave, Flushing, NY 11355",
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        primaryColor: "rgb(99, 0, 0)",
        logoText: " ",
        relevantText: "You're near the store! Show your coupon for $10 OFF 🎉"
    };

    const userData: UserData = {
        userId: "test-user-999",
        userName: "Test User",
    };

    try {
        const passBuffer = await WalletService.generatePass(merchantData, userData, "TEST-CODE");
        console.log("✅ Pass generated. Buffer size:", passBuffer.length);
    } catch (err: any) {
        console.error("❌ Generation failed in WalletService:", err);
        if (err.stack) console.error(err.stack);
        throw err;
    }
}

test().catch(error => {
    console.error("❌ Test failed:", error);
});
