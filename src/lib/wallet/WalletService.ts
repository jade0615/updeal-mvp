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

    private static async getCertificates() {
        const signerKeyPassword = process.env.APPLE_SIGNER_KEY_PASSWORD || "123456";

        let wwdr: Buffer;
        if (process.env.APPLE_WWDR_CERT) {
            wwdr = Buffer.from(process.env.APPLE_WWDR_CERT, "base64");
        } else {
            const wwdrPath = path.join(this.certsDir, "wwdr.pem");
            if (!fs.existsSync(wwdrPath)) throw new Error("Missing Apple WWDR certificate");
            wwdr = fs.readFileSync(wwdrPath);
        }

        let signerCert: Buffer;
        if (process.env.APPLE_SIGNER_CERT) {
            signerCert = Buffer.from(process.env.APPLE_SIGNER_CERT, "base64");
        } else {
            const certPath = path.join(this.certsDir, "signerCert.pem");
            if (!fs.existsSync(certPath)) throw new Error("Missing Apple Signer certificate");
            signerCert = fs.readFileSync(certPath);
        }

        let signerKey: Buffer;
        if (process.env.APPLE_SIGNER_KEY) {
            signerKey = Buffer.from(process.env.APPLE_SIGNER_KEY, "base64");
        } else {
            const keyPath = path.join(this.certsDir, "signerKey.pem");
            if (!fs.existsSync(keyPath)) throw new Error("Missing Apple Signer key");
            signerKey = fs.readFileSync(keyPath);
        }

        return {
            wwdr,
            signerCert,
            signerKey,
            signerKeyPassphrase: signerKeyPassword
        };
    }

    static async generatePass(merchantData: MerchantData, userData: UserData, authenticationToken?: string): Promise<Buffer> {
        try {
            console.log("🔧 Starting pass generation (Aggressive Removal Mode)");
            const certificates = await this.getCertificates();
            const serialNumber = `${merchantData.merchantId}-${userData.userId}-${Date.now()}`;

            const pass = await PKPass.from({
                model: this.templateDir,
                certificates
            }, {
                serialNumber: serialNumber,
                passTypeIdentifier: (process.env.APPLE_PASS_TYPE_ID || "pass.hiraccoon.app.coupon").trim(),
                teamIdentifier: (process.env.APPLE_TEAM_ID || "ULZM5FW53S").trim(),
                organizationName: "HiRaccoon",
                description: "HiRaccoon Coupon",
                backgroundColor: "rgb(99, 0, 0)", // Hardcoded as per user request to override DB
                foregroundColor: "rgb(255, 255, 255)",
                labelColor: "rgb(218, 165, 32)",
                logoText: (merchantData.logoText === "" ? " " : merchantData.logoText) || " ",
                // Explicitly provide empty array to start
                barcodes: []
            } as any);

            // --- ULTIMATE BARCODE REMOVAL HACK ---
            // We use Object.defineProperty to lock 'barcodes' and 'barcode' to null.
            // This prevents the library from re-adding them later (e.g. during getAsBuffer).
            try {
                const lockProperty = (obj: any, prop: string) => {
                    Object.defineProperty(obj, prop, {
                        get: () => null,
                        set: () => { /* ignore */ },
                        configurable: false,
                        enumerable: true
                    });
                };

                lockProperty(pass, 'barcodes');
                lockProperty((pass as any)._fields, 'barcodes');
                lockProperty(pass, 'barcode');
                lockProperty((pass as any)._fields, 'barcode');

                // Clear internal private caches if they exist
                (pass as any)._barcodes = null;
                (pass as any)._barcode = null;

                console.log("🔐 Barcode properties locked to null");
            } catch (e) {
                console.log("⚠️ Warning: Properties could not be locked:", e);
            }
            // --------------------------------------

            // --- Redemption Code (Header for Max Visibility) ---
            pass.headerFields.push({
                key: "redemption_code",
                label: "CODE",
                value: authenticationToken || "COUPON-1234"
            });

            // --- Merchant Name (Primary Area) ---
            // User requested to keep primaryFields empty to avoid covering the strip image.
            // Merchant name is already shown in the logo area.
            pass.primaryFields.length = 0;

            // --- Offer & Expiry (Secondary Area - Below Banner) ---
            // Moving these here ensures they don't overlap with the strip image.
            pass.secondaryFields.push({
                key: "offer",
                label: "OFFER",
                value: merchantData.offerText
            });

            pass.secondaryFields.push({
                key: "expires",
                label: "EXPIRES",
                value: new Date(merchantData.expirationDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            });

            pass.backFields.push({
                key: "instructions",
                label: "HOW TO REDEEM",
                value: "Show the redemption code on the front of this pass to the staff at the time of checkout."
            });

            pass.backFields.push({
                key: "terms",
                label: "TERMS & CONDITIONS",
                value: "1. Valid for one-time use only.\n2. Cannot be combined with other offers.\n3. Valid only at participating locations."
            });

            if (merchantData.address) {
                pass.backFields.push({ key: "store_location", label: "STORE LOCATION", value: merchantData.address });
            }

            if (merchantData.latitude !== undefined && merchantData.longitude !== undefined) {
                pass.setLocations({
                    latitude: Number(merchantData.latitude),
                    longitude: Number(merchantData.longitude),
                    relevantText: merchantData.relevantText || "You are near the store! Show your code to redeem."
                });
            }

            pass.setExpirationDate(merchantData.expirationDate);

            const buffer = pass.getAsBuffer();
            console.log("✅ Pass generated successfully (Minimalist)");
            return buffer;

        } catch (error) {
            console.error("❌ WalletService Error:", error);
            throw error;
        }
    }
}
