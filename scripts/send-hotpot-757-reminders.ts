
import { createClient } from '@supabase/supabase-js';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getHotPot757ExpirationReminderTemplate } from '../src/lib/email/templates';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

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

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const transporter = nodemailer.createTransport(smtpConfig);

const MERCHANT_SLUG = 'hot-pot-757-colonial-heights';
const DRY_RUN = process.argv.includes('--dry-run');
const TEST_EMAIL = process.argv.find(arg => arg.startsWith('--test='))?.split('=')[1];

async function main() {
    console.log(`🚀 Starting Expiration Reminder Campaign for ${MERCHANT_SLUG} (Aliyun SMTP)`);
    console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '📧 ACTUAL SEND'}`);
    if (TEST_EMAIL) console.log(`🎯 Test Email: ${TEST_EMAIL}`);

    // 1. Get Merchant
    const { data: merchant, error: mError } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('slug', MERCHANT_SLUG)
        .single();

    if (mError || !merchant) {
        console.error('❌ Merchant not found:', mError);
        return;
    }

    // 2. Get Unredeemed Coupons
    const { data: coupons, error: cError } = await supabase
        .from('coupons')
        .select(`
            user_id,
            users (
                email,
                name
            )
        `)
        .eq('merchant_id', merchant.id)
        .neq('status', 'redeemed');

    if (cError) {
        console.error('❌ Coupons error:', cError);
        return;
    }

    let recipients = coupons
        .map((c: any) => ({
            email: c.users?.email,
            name: c.users?.name
        }))
        .filter(u => u.email);

    // Deduplicate
    const uniqueMap = new Map();
    recipients.forEach(r => uniqueMap.set(r.email.toLowerCase(), r));
    recipients = Array.from(uniqueMap.values());

    if (TEST_EMAIL) {
        recipients = [{ email: TEST_EMAIL, name: 'Test User' }];
    }

    console.log(`📊 Found ${recipients.length} recipients.`);
    recipients.forEach((r, i) => console.log(`${i + 1}. ${r.name || 'N/A'} <${r.email}>`));

    if (DRY_RUN && !TEST_EMAIL) {
        console.log('\n✅ Dry run completed.');
        return;
    }

    console.log('\n📧 Sending emails...');
    let successCount = 0;
    let failCount = 0;

    for (const recipient of recipients) {
        try {
            await transporter.sendMail({
                from: 'Hiraccoon <info@hiraccoon.com>',
                to: recipient.email,
                subject: `Your Hot Pot 757 coupon is expiring soon! 🍲`,
                html: getHotPot757ExpirationReminderTemplate({
                    name: recipient.name || ''
                }),
            });
            console.log(`✅ Sent to ${recipient.email}`);
            successCount++;
        } catch (e: any) {
            console.error(`❌ Failed to send to ${recipient.email}:`);
            console.error(e);
            failCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`\n🎉 Campaign finished! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
