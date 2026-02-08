import fs from 'fs';
import path from 'path';

const assetsDir = path.join(process.cwd(), 'src/lib/wallet/templates/coupon.pass');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// A minimal valid 1x1 black PNG
const minPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const files = ['icon.png', 'logo.png', 'strip.png', 'icon@2x.png', 'logo@2x.png', 'strip@2x.png'];

files.forEach(file => {
    const filePath = path.join(assetsDir, file);
    fs.writeFileSync(filePath, minPng);
    console.log(`Created placeholder: ${filePath}`);
});
