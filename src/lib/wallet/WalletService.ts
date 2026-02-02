import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

export interface MerchantData {
    merchantId: string;
    name: string;
    offerText: string;
    latitude?: number;
    longitude?: number;
    expirationDate: Date;
    primaryColor?: string;
    secondaryColor?: string;
    logoText?: string;
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
            const absoluteTemplateDir = path.resolve(this.templateDir);

            // 1. Prepare certificates
            const certificates = await this.getCertificates();

            // 2. Generate Unique Serial Number
            const serialNumber = `${merchantData.merchantId}-${userData.userId}-${Date.now()}`;

            // 3. Prepare Pass Properties
            const props = {
                serialNumber: merchantData.merchantId ? `${merchantData.merchantId}-${userData.userId}` : serialNumber, // More stable serial number for updates
                passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID || "pass.com.hiraccoon.coupon",
                teamIdentifier: process.env.APPLE_TEAM_ID || "ULZM5FW53S",
                backgroundColor: merchantData.primaryColor || "rgb(255, 184, 0)",
                logoText: merchantData.logoText || "HiRaccoon",
                expirationDate: merchantData.expirationDate.toISOString(),
                // Apple Wallet Web Service Integration
                webServiceURL: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet` : undefined,
                authenticationToken: authenticationToken,
                barcodes: [
                    {
                        message: JSON.stringify({
                            m: merchantData.merchantId,
                            u: userData.userId,
                            s: serialNumber,
                        }),
                        format: "PKBarcodeFormatQR",
                        messageEncoding: "iso-8859-1",
                    },
                ],
            };

            // 4. Initialize the pass structure
            const pass = new PKPass({}, certificates, props);

            // 5. Force-inject assets from the folder
            if (fs.existsSync(absoluteTemplateDir)) {
                const files = fs.readdirSync(absoluteTemplateDir);
                for (const file of files) {
                    if (file === "pass.json" || file.toLowerCase().endsWith(".png")) {
                        const content = fs.readFileSync(path.join(absoluteTemplateDir, file));
                        pass.addBuffer(file, content);
                    }
                }
            }

            // 6. Add coupon fields
            if (pass.primaryFields) {
                pass.primaryFields.push({
                    key: "offer",
                    label: "OFFER",
                    value: merchantData.offerText,
                });
            }

            // 7. Add Geofencing (Merchant Coordinates)
            // If merchant has coordinates, add them to the pass
            if (merchantData.latitude && merchantData.longitude) {
                pass.setLocations({
                    latitude: merchantData.latitude,
                    longitude: merchantData.longitude,
                    relevantText: merchantData.logoText ? `${merchantData.logoText}：您已到达商家附近，进店展示卡券！` : "您已到达商家附近，进店展示卡券！",
                });
            } else {
                // Default to Flushing coordinate if none provided (for HiRaccoon MVP context)
                pass.setLocations({
                    latitude: 40.7429,
                    longitude: -73.8184,
                    relevantText: `HiRaccoon：您已到达合作商家附近，进店展示优惠！`,
                });
            }

            // 8. Generate and return the buffer
            console.log("✅ Pass generated successfully for merchant:", merchantData.name);
            return pass.getAsBuffer();

        } catch (error) {
            console.error("❌ WalletService Error:", error);
            throw error;
        }
    }
}