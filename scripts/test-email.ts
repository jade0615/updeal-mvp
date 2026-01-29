import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testEmail() {
    console.log('Testing Aliyun SMTP connection...');

    const host = process.env.ALIYUN_SMTP_HOST;
    const user = process.env.ALIYUN_SMTP_USER;
    const pass = process.env.ALIYUN_SMTP_PASS;

    console.log('Config:', {
        host,
        user,
        passLength: pass ? pass.length : 0, // Don't log the actual password
        port: 465
    });

    if (!host || !user || !pass) {
        console.error('❌ Missing configuration in .env.local');
        return;
    }

    const transporter = nodemailer.createTransport({
        host,
        port: 465,
        secure: true,
        auth: { user, pass },
        debug: true, // Enable debug logs
        logger: true // Log to console
    });

    try {
        console.log('Verifying connection...');
        await transporter.verify();
        console.log('✅ SMTP Connection Verified!');

        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"UpDeal Test" <${user}>`,
            to: user, // Send to self to test
            subject: 'UpDeal SMTP Test 🚀',
            text: 'If you receive this, the email configuration is working correctly.',
            html: '<h1>SMTP Works!</h1><p>This is a test email from the UpDeal debug script.</p>'
        });

        console.log('✅ Message sent:', info.messageId);
        console.log('Response:', info.response);
    } catch (error) {
        console.error('❌ Error occurred:', error);
    }
}

testEmail();
