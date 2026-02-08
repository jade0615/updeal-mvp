
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
        relevantText: "Test Location"
    });

    const raw = pass.getAsRaw();
    const passJson = JSON.parse(raw["pass.json"].toString());
    console.log("Keys in pass.json:", Object.keys(passJson));
    if (passJson.locations) {
        console.log("Locations found:", JSON.stringify(passJson.locations));
    } else {
        console.log("Locations NOT found!");
    }
}

test().catch(console.error);
