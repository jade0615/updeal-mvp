import http2 from 'http2';
import path from 'path';
import fs from 'fs';

let cert: Buffer | undefined;
let key: Buffer | undefined;

function loadCerts() {
    if (cert && key) return;

    const certsDir = path.join(process.cwd(), "src/certificates");

    if (process.env.APPLE_SIGNER_CERT) {
        cert = Buffer.from(process.env.APPLE_SIGNER_CERT, "base64");
    } else {
        const certPath = path.join(certsDir, "signerCert.pem");
        if (fs.existsSync(certPath)) cert = fs.readFileSync(certPath);
    }

    if (process.env.APPLE_SIGNER_KEY) {
        key = Buffer.from(process.env.APPLE_SIGNER_KEY, "base64");
    } else {
        const keyPath = path.join(certsDir, "signerKey.pem");
        if (fs.existsSync(keyPath)) key = fs.readFileSync(keyPath);
    }

    if (!cert || !key) {
        throw new Error("Missing Apple Signer certificate or key for APNs push");
    }
}

export async function sendWalletPush(pushToken: string): Promise<boolean> {
    try {
        loadCerts();

        return new Promise((resolve) => {
            const client = http2.connect('https://api.push.apple.com', {
                cert: cert,
                key: key,
                passphrase: process.env.APPLE_SIGNER_KEY_PASSWORD || "123456"
            });

            client.on('error', (err) => {
                console.error("APNs Connection Error:", err);
                resolve(false);
            });

            const buf = Buffer.from(JSON.stringify({ aps: {} }));

            const req = client.request({
                ':method': 'POST',
                ':path': `/3/device/${pushToken}`,
                'apns-topic': (process.env.APPLE_PASS_TYPE_ID || "pass.hiraccoon.app.coupon").trim(),
                'apns-push-type': 'background',
                'apns-priority': '5',
            });

            req.on('response', (headers, flags) => {
                const status = headers[':status'];
                // 200 means Success.
                // Anything else means failure (e.g. 410 Unregistered)
                if (status === 200) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            req.setEncoding('utf8');
            req.on('data', (chunk) => {
                // Read error payload but we don't necessarily need it to return
            });

            req.on('end', () => {
                client.close();
            });

            req.write(buf);
            req.end();
        });
    } catch (e) {
        console.error("Failed to push to APNs:", e);
        return false;
    }
}
