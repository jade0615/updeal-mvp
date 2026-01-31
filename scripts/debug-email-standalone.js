
const nodemailer = require('nodemailer');

// CREDENTIALS FROM USER
const user = 'info@hiraccoon.com';
const pass = 'Z2CrZ9punU97RaA';

// HOST CANDIDATES
const hosts = [
    { name: 'Aliyun Enterprise (Qiye)', host: 'smtp.qiye.aliyun.com', port: 465 },
    { name: 'Aliyun Direct Mail (Hangzhou)', host: 'smtpdm.aliyun.com', port: 465 }, // Try 465 SSL, or 80/25
    { name: 'Aliyun Direct Mail (Singapore)', host: 'smtpdm-ap-southeast-1.aliyun.com', port: 465 },
    { name: 'Aliyun Direct Mail (Sydney)', host: 'smtpdm-ap-southeast-2.aliyun.com', port: 465 }
];

async function testConnection(config) {
    console.log(`\nTesting ${config.name} (${config.host}:${config.port})...`);
    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.port === 465,
        auth: { user, pass }
    });

    try {
        const info = await transporter.sendMail({
            from: `"Hiraccoon Debug" <${user}>`,
            to: 'wisdomjadefeng@gmail.com',
            subject: `Test Email from ${config.name}`,
            text: `If you receive this, the SMTP configuration for ${config.name} is CORRECT.\nHost: ${config.host}\nPort: ${config.port}`
        });
        console.log(`✅ SUCCESS! Message ID: ${info.messageId}`);
        return true;
    } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        // console.log(err);
        return false;
    }
}

async function run() {
    console.log('Starting SMTP Diagnostic...');

    for (const host of hosts) {
        const success = await testConnection(host);
        if (success) {
            console.log('\n🎉 FOUND WORKING CONFIGURATION!');
            console.log(`Please set ALIYUN_SMTP_HOST = ${host.host}`);
            break;
        }
    }
}

run();
