import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { getExpirationReminderEmailTemplate } from '../src/lib/email/templates';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';
const resendApiKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const MERCHANT_SLUG = 'honoo-ramen-bar-1';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    console.log(`🚀 Starting Expiration Reminder Campaign for ${MERCHANT_SLUG}`);
    console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (No emails will be sent)' : '📧 ACTUAL SEND'}`);

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
        .select('user_id')
        .eq('merchant_id', merchant.id)
        .neq('status', 'redeemed');

    if (cError) {
        console.error('❌ Coupons error:', cError);
        return;
    }

    const userIds = Array.from(new Set(coupons.map(c => c.user_id).filter(Boolean))) as string[];

    if (userIds.length === 0) {
        console.log('✅ No unredeemed coupons found.');
        return;
    }

    // 3. Get Users
    const { data: users, error: uError } = await supabase
        .from('users')
        .select('email, name')
        .in('id', userIds)
        .not('email', 'is', null);

    if (uError) {
        console.error('❌ Users error:', uError);
        return;
    }

    // --- Add manual recipients list ---
    const manualRecipients = [
        { email: 'yaaqiu@gmail.com', name: 'Yaaqiu' }
    ];

    // Merge manual recipients if they are not already in the list
    manualRecipients.forEach(manual => {
        if (!users.some(u => u.email?.toLowerCase() === manual.email.toLowerCase())) {
            users.push(manual);
        }
    });

    console.log(`📊 Found ${users.length} unique customers with email.`);
    console.log('--- Recipient List ---');
    users.forEach((u, i) => console.log(`${i + 1}. ${u.name || 'N/A'} <${u.email}>`));

    if (DRY_RUN) {
        console.log('\n✅ Dry run completed. No emails sent.');
        return;
    }

    if (!resend) {
        console.error('❌ RESEND_API_KEY not configured. Cannot send emails.');
        process.exit(1);
    }

    console.log('\n📧 Sending emails...');
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
        try {
            await resend.emails.send({
                from: 'Honoo Ramen Bar <reminders@updeal.xyz>',
                to: [user.email!],
                subject: 'Your Honoo Ramen Bar coupon is expiring soon! 🍜',
                html: getExpirationReminderEmailTemplate({ name: user.name || '' }),
            });
            console.log(`✅ Sent to ${user.email}`);
            successCount++;
        } catch (e) {
            console.error(`❌ Failed to send to ${user.email}:`, e);
            failCount++;
        }
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n🎉 Campaign finished! Success: ${successCount}, Failed: ${failCount}`);
}

main().catch(console.error);
