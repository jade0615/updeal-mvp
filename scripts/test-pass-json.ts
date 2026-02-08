
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

// Mock certifications for testing (just empty buffers or whatever, we won't export signed yet)
const mockCerts = {
    wwdr: Buffer.alloc(0),
    signerCert: Buffer.alloc(0),
    signerKey: Buffer.alloc(0),
    signerKeyPassphrase: "test"
};

async function test() {
    const templateDir = path.join(process.cwd(), "src/lib/wallet/templates/coupon.pass");

    const pass = await PKPass.from({
        model: templateDir,
        certificates: mockCerts as any
    }, {
        serialNumber: "test-123",
        passTypeIdentifier: "pass.com.test",
        teamIdentifier: "ABC123",
        organizationName: "Test Org",
        description: "Test Pass"
    });

    pass.setLocations({
        latitude: 31.0748,
        longitude: 121.5080,
        relevantText: "上海办公室折扣：您已到达商家附近，进店展示卡券！"
    });

    // Export raw to see what's inside
    const raw = pass.getAsRaw();
    const passJsonBuffer = raw["pass.json"];
    console.log("--- Generated pass.json ---");
    console.log(passJsonBuffer.toString());
}

test().catch(console.error);
