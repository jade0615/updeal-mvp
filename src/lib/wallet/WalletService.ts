import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

export interface MerchantData {
    merchantId: string;
    name: string;
    offerText: string;
    latitude?: number;
    longitude?: number;
    address?: string;
    expirationDate: Date;
    primaryColor?: string;
    secondaryColor?: string;
    logoText?: string;
    relevantText?: string;
}

export interface UserData {
    userId: string;
    userName: string;
}

export class WalletService {
    private static certsDir = path.join(process.cwd(), "src/certificates");
    private static templateDir = path.join(process.cwd(), "src/lib/wallet/templates/coupon.pass");

    /**
     * Helper to load certificates from either environment variables or local files.
     */
    private static async getCertificates() {
        // Signer Key Password
        const signerKeyPassword = process.env.APPLE_SIGNER_KEY_PASSWORD || "123456";

        // 1. Load WWDR Certificate
        let wwdr: Buffer;
        if (process.env.APPLE_WWDR_CERT) {
            wwdr = Buffer.from(process.env.APPLE_WWDR_CERT, "base64");
        } else {
            const wwdrPath = path.join(this.certsDir, "wwdr.pem");
            if (!fs.existsSync(wwdrPath)) {
                throw new Error("Missing Apple WWDR certificate (env or file)");
            }
            wwdr = fs.readFileSync(wwdrPath);
        }

        // 2. Load Signer Certificate (PEM)
        let signerCert: Buffer;
        if (process.env.APPLE_SIGNER_CERT) {
            signerCert = Buffer.from(process.env.APPLE_SIGNER_CERT, "base64");
        } else {
            const certPath = path.join(this.certsDir, "signerCert.pem");
            if (!fs.existsSync(certPath)) {
                throw new Error("Missing Apple Signer certificate (env or file)");
            }
            signerCert = fs.readFileSync(certPath);
        }

        // 3. Load Signer Key (PEM)
        let signerKey: Buffer;
        if (process.env.APPLE_SIGNER_KEY) {
            signerKey = Buffer.from(process.env.APPLE_SIGNER_KEY, "base64");
        } else {
            const keyPath = path.join(this.certsDir, "signerKey.pem");
            if (!fs.existsSync(keyPath)) {
                throw new Error("Missing Apple Signer key (env or file)");
            }
            signerKey = fs.readFileSync(keyPath);
        }

        return {
            wwdr,
            signerCert,
            signerKey,
            signerKeyPassphrase: signerKeyPassword
        };
    }

    /**
     * Generates a signed .pkpass file buffer for a specific merchant and user.
     */
    static async generatePass(merchantData: MerchantData, userData: UserData, authenticationToken?: string): Promise<Buffer> {
        try {
            console.log("🔧 Starting pass generation...");

            // 1. Prepare certificates
            console.log("📜 Loading certificates...");
            const certificates = await this.getCertificates();
            console.log("✅ Certificates loaded");

            // 2. Generate Unique Serial Number (includes timestamp for uniqueness)
            const serialNumber = `${merchantData.merchantId}-${userData.userId}-${Date.now()}`;
            console.log("🔑 Serial number:", serialNumber);

            // 3. Create pass from template with all properties
            console.log("📦 Creating pass from template...");
            const pass = await PKPass.from({
                model: this.templateDir,
                certificates
            }, {
                serialNumber: serialNumber,
                passTypeIdentifier: (process.env.APPLE_PASS_TYPE_ID || "pass.hiraccoon.app.coupon").trim(),
                teamIdentifier: (process.env.APPLE_TEAM_ID || "ULZM5FW53S").trim(),
                organizationName: "HiRaccoon",
                description: "HiRaccoon Coupon",
                backgroundColor: merchantData.primaryColor || "rgb(99, 0, 0)",
                foregroundColor: "rgb(255, 248, 230)",
                labelColor: "rgb(199, 171, 118)",
                logoText: merchantData.logoText || "HiRaccoon",
            });
            console.log("✅ Pass created from template");
            console.log("🔍 Initial pass.json content:", JSON.stringify((pass as any)._fields, null, 2));

            // 4. Add coupon primary field (offer)
            console.log("➕ Adding primary fields...");
            pass.primaryFields.push({
                key: "offer",
                label: "OFFER",
                value: merchantData.offerText,
            });

            // 5. Add secondary field (merchant)
            console.log("➕ Adding secondary fields...");
            pass.secondaryFields.push({
                key: "merchant",
                label: "MERCHANT",
                value: merchantData.name,
            });

            // 6. Add auxiliary field (expires)
            console.log("➕ Adding auxiliary fields...");
            pass.auxiliaryFields.push({
                key: "expires",
                label: "EXPIRES",
                value: new Date(merchantData.expirationDate).toLocaleDateString(),
            });

            // 7. Add back fields (terms)
            console.log("➕ Adding back fields...");
            pass.backFields.push({
                key: "terms",
                label: "TERMS & CONDITIONS",
                value: "Redeem this coupon at the merchant location. Subject to terms and conditions.",
            });

            // 7.5 Add Location to back fields for UI visibility
            if (merchantData.address) {
                console.log("➕ Adding address to back fields...");
                pass.backFields.push({
                    key: "store_location",
                    label: "STORE LOCATION",
                    value: merchantData.address,
                });
            }

            if (merchantData.latitude !== undefined && merchantData.longitude !== undefined) {
                console.log("📍 Adding geofencing coordinates:", merchantData.latitude, merchantData.longitude);

                const relevantText = merchantData.relevantText || (merchantData.logoText
                    ? `${merchantData.logoText}：您已到达商家附近，进店展示卡券！`
                    : "您已到达商家附近，进店展示卡券！");

                pass.setLocations({
                    latitude: Number(merchantData.latitude),
                    longitude: Number(merchantData.longitude),
                    relevantText: relevantText,
                });
            }

            // 9. Set expiration
            console.log("⏰ Setting expiration...");
            pass.setExpirationDate(merchantData.expirationDate);

            // 10. Explicitly clear both barcodes and legacy barcode field
            console.log("🔲 Clearing barcodes forcefully...");
            try {
                // passkit-generator uses setBarcodes for the plural barcodes array
                pass.setBarcodes(null as any);
                // Also explicitly clear the structure if we can access it
                (pass as any)._barcodes = [];
                (pass as any)._barcode = null;
            } catch (e) {
                console.log("⚠️ Failed to clear barcodes manually, but setBarcodes was called");
            }

            // Log final pass structure for debugging
            console.log("🔍 Final pass fields before buffer generation:", JSON.stringify((pass as any)._fields, (key, value) => {
                if (key === "_barcodes" || key === "barcodes" || key === "barcode") return value;
                return value;
            }, 2));

            // 11. Generate and return the buffer
            console.log("💾 Generating buffer...");
            const buffer = pass.getAsBuffer();
            console.log("✅ Pass generated successfully for merchant:", merchantData.name);
            return buffer;

        } catch (error) {
            console.error("❌ WalletService Error:", error);
            throw error;
        }
    }
}
