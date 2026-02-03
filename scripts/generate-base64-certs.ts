
import fs from 'fs';
import path from 'path';

const certsDir = path.join(process.cwd(), 'src/certificates');

const files = ['wwdr.pem', 'signerCert.pem', 'signerKey.pem'];

console.log('--- Base64 Certificates for Vercel ---');
files.forEach(file => {
    const filePath = path.join(certsDir, file);
    if (fs.existsSync(filePath)) {
        const base64 = fs.readFileSync(filePath).toString('base64');
        const envName = file.replace('.pem', '').replace('signer', 'APPLE_SIGNER').toUpperCase();
        const finalEnvName = envName === 'WWDR' ? 'APPLE_WWDR_CERT' :
            envName === 'APPLE_SIGNERCERT' ? 'APPLE_SIGNER_CERT' :
                envName === 'APPLE_SIGNERKEY' ? 'APPLE_SIGNER_KEY' : envName;
        console.log(`${finalEnvName}=${base64.substring(0, 50)}... (Length: ${base64.length})`);
    } else {
        console.log(`❌ Missing: ${file}`);
    }
});
