const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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

const HONOO_GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
const HONOO_OTHER_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
    console.log(`🚀 Email Campaign for HONOO RAMEN BAR`);

    // Fetch coupons from BOTH possible IDs, including email_sent_stage
    const { data: coupons } = await supabase
        .from('coupons')
        .select('id, email_sent_stage, user_id, users(email, name)')
        .in('merchant_id', [HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID]);

    // Merge all recipients
    const recipientsMap = new Map();

    (coupons || []).forEach(c => {
        if (c.users && c.users.email && c.users.email.includes('@')) {
            const email = c.users.email.toLowerCase();
            // If we haven't seen this email OR the current record is NOT sent yet, add it
            if (!recipientsMap.has(email) || c.email_sent_stage !== 'expiring_reminder') {
                recipientsMap.set(email, {
                    email: c.users.email,
                    name: c.users.name || 'Customer',
                    couponId: c.id,
                    sentStage: c.email_sent_stage
                });
            }
        }
    });

    let uniqueRecipients = Array.from(recipientsMap.values());

    // Filter out those who already received the expiring_reminder
    uniqueRecipients = uniqueRecipients.filter(r => r.sentStage !== 'expiring_reminder');

    console.log(`📊 Found ${uniqueRecipients.length} recipients who still need the reminder.`);
    uniqueRecipients.forEach((u, i) => console.log(`${i + 1}. ${u.name} <${u.email}> (Coupon: ${u.couponId})`));

    if (DRY_RUN) return;

    for (const recipient of uniqueRecipients) {
        try {
            console.log(`Sending to ${recipient.email}...`);
            const { success } = await transporter.sendMail({
                from: 'Honoo Ramen Bar <info@hiraccoon.com>',
                to: recipient.email,
                subject: `Your Honoo Ramen Bar coupon is expiring soon! 🍜`,
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                        <p>Hi there,</p>
                        <p>Just a friendly reminder — your exclusive Free Drink coupon for <strong>Honoo Ramen Bar</strong> is expiring soon! Don't miss out on this deal.</p>
                        <p>Come visit us before it's too late:</p>
                        <p>
                            📍 <strong>Honoo Ramen Bar</strong><br />
                            📫 814 W Grace St, Richmond, VA 23220<br />
                            📞 (804) 658-2231
                        </p>
                        <p>🔗 <strong>View your coupon:</strong> <a href="https://hiraccoon.com/honoo-ramen-bar-1" style="color: #e63946; text-decoration: none;">https://hiraccoon.com/honoo-ramen-bar-1</a></p>
                        <p>We can't wait to see you!</p>
                        <p>Best,<br />Honoo Ramen Bar</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                        <p style="font-size: 12px; color: #999; text-align: center;">Brought to you by Updeal.</p>
                    </div>
                `,
            });

            console.log(`✅ Sent to ${recipient.email}`);

            // Update database to prevent double-send in scheduled batch
            if (recipient.couponId) {
                await supabase
                    .from('coupons')
                    .update({ email_sent_stage: 'expiring_reminder' })
                    .eq('id', recipient.couponId);
                console.log(`📝 Updated status for coupon ${recipient.couponId}`);
            }
        } catch (e) {
            console.error(`❌ Failed for ${recipient.email}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}

main().catch(console.error);
