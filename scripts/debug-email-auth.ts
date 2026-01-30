import nodemailer from 'nodemailer';

async function testAuth() {
    console.log('Testing SMTP Auth for info@hiraccoon.com...');

    const transporter = nodemailer.createTransport({
        host: 'smtpdm.aliyun.com',
        port: 465,
        secure: true,
        auth: {
            user: 'info@hiraccoon.com',
            pass: 'Z2CrZ9punU97RaA',
        },
        debug: true, // Enable debug output
        logger: true // Enable logger
    });

    try {
        await transporter.verify();
        console.log('✅ SMTP Connection & Authentication Successful!');
    } catch (error) {
        console.error('❌ SMTP Connection Failed:', error);
    }
}

testAuth();
