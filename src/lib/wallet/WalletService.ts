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
                backgroundColor: merchantData.primaryColor || "rgb(99, 0, 0)",
                foregroundColor: "rgb(255, 248, 230)",
                labelColor: "rgb(199, 171, 118)",
                logoText: merchantData.logoText || "HiRaccoon",
                barcodes: [] // Start empty
            } as any);

            pass.primaryFields.push({ key: "offer", label: "OFFER", value: merchantData.offerText });
            pass.secondaryFields.push({ key: "merchant", label: "MERCHANT", value: merchantData.name });
            pass.auxiliaryFields.push({ key: "expires", label: "EXPIRES", value: new Date(merchantData.expirationDate).toLocaleDateString() });
            pass.backFields.push({ key: "terms", label: "TERMS & CONDITIONS", value: "Redeem this coupon at the merchant location." });

            if (merchantData.address) {
                pass.backFields.push({ key: "store_location", label: "STORE LOCATION", value: merchantData.address });
            }

            if (merchantData.latitude !== undefined && merchantData.longitude !== undefined) {
                pass.setLocations({
                    latitude: Number(merchantData.latitude),
                    longitude: Number(merchantData.longitude),
                    relevantText: merchantData.relevantText || "You are near the store!"
                });
            }

            pass.setExpirationDate(merchantData.expirationDate);

            // VERIFICATION BARCODE - This will tell us if this code is running.
            pass.setBarcodes([{
                message: "QR_CODE_MUST_BE_DELETED_V6",
                format: "PKBarcodeFormatQR",
                messageEncoding: "iso-8859-1"
            }]);

            // Add debug info to back fields
            pass.backFields.push({
                key: "debug_info",
                label: "DEBUG INFO",
                value: `Built at: ${new Date().toISOString()}`
            });

            return pass.getAsBuffer();

        } catch (error) {
            console.error("❌ WalletService Error:", error);
            throw error;
        }
    }
}
