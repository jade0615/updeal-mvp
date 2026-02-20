
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

// Aliyun SMTP Config
const smtpConfig = {
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@hiraccoon.com',
        pass: 'Z2CrZ9punU97RaA',
    },
};

const supabase = createClient(supabaseUrl, supabaseKey);
const transporter = nodemailer.createTransport(smtpConfig);

const TEST_EMAIL = 'yaaqiu@gmail.com';

async function main() {
    console.log(`🚀 [JS] Testing Aliyun SMTP with Phone but NO Address`);

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #e63946;">Hello!</h2>
            <p>We'd love to see you again at <strong>Hot Pot 757</strong>.</p>
            <p>Your special reward is ready. Simply show your phone at the store.</p>
            <p>Contact: (804) 805-8363</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://hiraccoon.com/hot-pot-757-colonial-heights" style="background-color: #e63946; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Reward</a>
            </div>
            <hr />
            <p style="font-size: 12px; color: #999; text-align: center;">Brought to you by Updeal.</p>
        </div>
    `;

    try {
        console.log(`Sending to ${TEST_EMAIL}...`);
        const info = await transporter.sendMail({
            from: 'Hiraccoon <info@hiraccoon.com>',
            to: TEST_EMAIL,
            subject: `Thank you from Hot Pot 757 🍜`,
            html: html,
        });
        console.log(`✅ Sent! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error('❌ Failed:');
        console.error(err);
    }
}

main();
