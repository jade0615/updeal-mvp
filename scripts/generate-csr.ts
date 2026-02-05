import forge from 'node-forge';
import fs from 'fs';
import path from 'path';

const certsDir = path.join(process.cwd(), 'src/certificates');

if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
}

console.log('Generating 2048-bit RSA key pair...');
const keys = forge.pki.rsa.generateKeyPair(2048);

// 1. Save Private Key
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const keyPath = path.join(certsDir, 'signerKey.key');
fs.writeFileSync(keyPath, privateKeyPem);
console.log(`Private key saved to: ${keyPath}`);

// 2. Generate CSR
console.log('Creating Certificate Signing Request (CSR)...');
const csr = forge.pki.createCertificationRequest();
csr.publicKey = keys.publicKey;
csr.setSubject([
    {
        name: 'commonName',
        value: 'HiRaccoon',
    },
    {
        name: 'countryName',
        value: 'US',
    },
    {
        name: 'organizationName',
        value: 'HiRaccoon',
    },
]);

// Sign the CSR with the private key
csr.sign(keys.privateKey);

// 3. Save CSR
const csrPem = forge.pki.certificationRequestToPem(csr);
const csrPath = path.join(certsDir, 'request.csr');
fs.writeFileSync(csrPath, csrPem);
console.log(`CSR saved to: ${csrPath}`);

console.log('\nSuccess! You can now upload "request.csr" to the Apple Developer Portal.');
