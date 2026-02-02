import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

const certsDir = path.join(process.cwd(), 'src/certificates');

const convertCerToPem = (inputFile: string, outputFile: string) => {
    const inputPath = path.join(certsDir, inputFile);
    const outputPath = path.join(certsDir, outputFile);

    if (!fs.existsSync(inputPath)) {
        console.error(`Input file not found: ${inputPath}`);
        return;
    }

    const der = fs.readFileSync(inputPath);

    try {
        // ASN.1 parse the DER-encoded certificate
        const asn1 = forge.asn1.fromDer(forge.util.createBuffer(der));
        const cert = forge.pki.certificateFromAsn1(asn1);
        const pem = forge.pki.certificateToPem(cert);

        fs.writeFileSync(outputPath, pem);
        console.log(`Converted ${inputFile} to ${outputFile}`);
    } catch (err) {
        if (der.toString().includes('-----BEGIN CERTIFICATE-----')) {
            // It's already PEM, just copy/rename
            fs.writeFileSync(outputPath, der);
            console.log(`${inputFile} is already in PEM format, copied to ${outputFile}`);
        } else {
            console.error(`Failed to convert ${inputFile}:`, err);
        }
    }
};

// 1. Convert WWDR
convertCerToPem('AppleWWDRCAG3.cer', 'wwdr.pem');

// 2. Convert Pass Certificate
convertCerToPem('pass.cer', 'signerCert.pem');

// 3. Handle Private Key (It was already PEM but let's ensure extension is .pem as expected by service)
const keyPath = path.join(certsDir, 'signerKey.key');
const keyPemPath = path.join(certsDir, 'signerKey.pem');
if (fs.existsSync(keyPath)) {
    fs.copyFileSync(keyPath, keyPemPath);
    console.log(`Copied signerKey.key to signerKey.pem`);
}
