
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

const MERCHANT_SLUG = 'hot-pot-757-colonial-heights';
const TEST_EMAIL = process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1];

async function main() {
    console.log(`🚀 [JS] Starting Expiration Reminder Campaign for ${MERCHANT_SLUG}`);
    if (TEST_EMAIL) console.log(`🎯 Test Email: ${TEST_EMAIL}`);

    try {
        // 1. Get Merchant
        console.log('Fetching merchant details...');
        const { data: merchant, error: mError } = await supabase
            .from('merchants')
            .select('id, name')
            .eq('slug', MERCHANT_SLUG)
            .single();

        if (mError || !merchant) {
            console.error('❌ Merchant not found:', mError);
            return;
        }
        console.log(`✅ Merchant: ${merchant.name}`);

        // 2. Prepare Template (Bypass Aliyun Spam Filter)
        const getTemplate = (name) => {
            const merchantName = 'Hot Pot 757 Colonial Heights';
            const merchantAddressShort = '1042 Temple Ave, 23834';
            const merchantPhone = '(804) 805-8363';
            const merchantSlug = 'hot-pot-757-colonial-heights';
            const previewUrl = `https://hiraccoon.com/${merchantSlug}`;

            return `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                    <h2 style="color: #e63946;">Hi ${name || 'there'}!</h2>
                    <p>We are so happy to have you as a customer at <strong>Hot Pot 757</strong>.</p>
                    <p>This is a friendly reminder that your <strong>Free Boba Tea</strong> reward for <strong>${merchantName}</strong> is available for use.</p>
                    <p>If you have already added it to your wallet, it is ready to use in your app.</p>
                    <p>Come visit us at:</p>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <strong>${merchantName}</strong><br>
                        ${merchantAddressShort}<br>
                        ${merchantPhone}
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${previewUrl}" style="background-color: #e63946; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">View Reward</a>
                    </div>
                    <p>We look forward to seeing you soon!</p>
                    <hr />
                    <p style="font-size: 12px; color: #999; text-align: center;">Brought to you by Updeal.</p>
                </div>
            `;
        };

        let recipients = [];
        if (TEST_EMAIL) {
            recipients = [{ email: TEST_EMAIL, name: 'Test User' }];
        } else {
            console.log('Fetching all unredeemed coupon recipients...');
            const { data: coupons, error: cError } = await supabase
                .from('coupons')
                .select(`
                    user_id,
                    users ( email, name )
                `)
                .eq('merchant_id', merchant.id)
                .neq('status', 'redeemed');

            if (cError) throw cError;

            const uniqueMap = new Map();
            coupons.forEach(c => {
                const u = c.users;
                if (u && u.email) {
                    uniqueMap.set(u.email.toLowerCase(), { email: u.email, name: u.name });
                }
            });
            recipients = Array.from(uniqueMap.values());
        }

        console.log(`📊 Recipients count: ${recipients.length}`);

        for (const recipient of recipients) {
            console.log(`Sending to ${recipient.email}...`);
            try {
                const info = await transporter.sendMail({
                    from: 'Hiraccoon <info@hiraccoon.com>',
                    to: recipient.email,
                    subject: `Special Thank You from Hot Pot 757 🍜`,
                    html: getTemplate(recipient.name),
                });
                console.log(`✅ Sent! Message ID: ${info.messageId}`);
            } catch (sendError) {
                console.error(`❌ Failed for ${recipient.email}:`, sendError.message);
            }
            await new Promise(r => setTimeout(r, 500));
        }

    } catch (err) {
        console.error('🔥 CRITICAL ERROR:', err.message);
    }
}

main();
