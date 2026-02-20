const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Aliyun SMTP Config (copied from src/lib/email.ts)
const smtpConfig = {
    host: 'smtpdm.aliyun.com',
    port: 465,
    secure: true,
    auth: {
        user: 'info@hiraccoon.com',
        pass: 'Z2CrZ9punU97RaA',
    },
};

const transporter = nodemailer.createTransport(smtpConfig);

const MERCHANT_SLUG = 'honoo-ramen-bar-1';
const MERCHANT_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    console.log(`🚀 Starting Email Campaign for HONOO RAMEN BAR (JS version)`);
    console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '📧 ACTUAL SEND'}`);

    const { data: merchant, error: mError } = await supabase
        .from('merchants')
        .select('id, name, content')
        .eq('slug', MERCHANT_SLUG)
        .single();

    if (mError || !merchant) {
        console.error('❌ Merchant error:', mError);
        return;
    }

    console.log(`✅ Merchant: ${merchant.name}`);

    const { data: claims, error: cError } = await supabase
        .from('customer_claims')
        .select('email, name')
        .eq('merchant_id', merchant.id)
        .not('email', 'is', null);

    if (cError) {
        console.error('❌ Claims error:', cError);
        return;
    }

    const uniqueRecipients = Array.from(new Map(claims.map(item => [item.email.toLowerCase(), item])).values());
    console.log(`📊 Recipients: ${uniqueRecipients.length}`);
    uniqueRecipients.forEach((u, i) => console.log(`${i + 1}. ${u.name} <${u.email}>`));

    if (DRY_RUN) return;

    for (const recipient of uniqueRecipients) {
        try {
            console.log(`Sending to ${recipient.email}...`);
            await transporter.sendMail({
                from: 'Hiraccoon <info@hiraccoon.com>',
                to: recipient.email,
                subject: `Special Thank You from ${merchant.name} 🍜`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
                        <h2 style="color: #e63946;">Hello ${recipient.name || 'there'}!</h2>
                        <p>Thank you for visiting <strong>${merchant.name}</strong> recently! We hope you enjoyed your meal.</p>
                        <p>We'd love to see you again soon!</p>
                        <hr />
                        <p style="font-size: 12px; color: #999; text-align: center;">Brought to you by Updeal.</p>
                    </div>
                `,
            });
            console.log(`✅ Sent to ${recipient.email}`);
        } catch (e) {
            console.error(`❌ Failed for ${recipient.email}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 500));
    }
}

main().catch(console.error);
