
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

async function test() {
    const certsDir = path.join(process.cwd(), "src/certificates");
    const templateDir = path.join(process.cwd(), "src/lib/wallet/templates/coupon.pass");

    const certificates = {
        wwdr: fs.readFileSync(path.join(certsDir, "wwdr.pem")),
        signerCert: fs.readFileSync(path.join(certsDir, "signerCert.pem")),
        signerKey: fs.readFileSync(path.join(certsDir, "signerKey.pem")),
        signerKeyPassphrase: "123456"
    };

    const pass = await PKPass.from({
        model: templateDir,
        certificates
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
    const passJson = JSON.parse(passJsonBuffer.toString());
    console.log("--- Generated pass.json (Pretty) ---");
    console.log(JSON.stringify(passJson, null, 2));
}

test().catch(console.error);
