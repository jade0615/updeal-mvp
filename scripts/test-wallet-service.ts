
import { WalletService, MerchantData, UserData } from "../src/lib/wallet/WalletService";
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

// Mock env variables for local testing
process.env.APPLE_SIGNER_KEY_PASSWORD = "123456";

async function test() {
    console.log("🚀 Running WalletService local test...");

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

    // We can't easily use passkit-generator to unzip a buffer here without dependencies, 
    // but we can look at the raw state if we modify WalletService to return the pass object or add logs.

    console.log("✅ Pass generated. Buffer size:", passBuffer.length);
}

test().catch(error => {
    console.error("❌ Test failed:", error);
});
