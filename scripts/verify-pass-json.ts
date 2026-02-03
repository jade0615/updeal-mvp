
import { PKPass } from "passkit-generator";
import path from "path";
import fs from "fs";

async function verify() {
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
        serialNumber: "shanghai-test-1",
        passTypeIdentifier: "pass.com.hiraccoon.coupon",
        teamIdentifier: "ULZM5FW53S",
        organizationName: "UpDeal",
        description: "Shanghai Office Test"
    });

    // Ensure types are strictly Number
    const lat = 31.0748;
    const lng = 121.5080;

    console.log("Setting location:", lat, lng);
    pass.setLocations({
        latitude: lat,
        longitude: lng,
        relevantText: "上海办公室折扣：您已到达商家附近，进店展示卡券！"
    });

    const raw = pass.getAsRaw();
    const passJsonString = raw["pass.json"].toString();
    fs.writeFileSync("final_pass_check.json", passJsonString);
    console.log("Final pass.json written to final_pass_check.json");
}

verify().catch(console.error);
