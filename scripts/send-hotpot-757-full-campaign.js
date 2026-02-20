
const { createClient } = require('@supabase/supabase-js');
const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;
const { ICalCalendarMethod, ICalEventBusyStatus } = require('ical-generator');
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

const MERCHANT_SLUG = 'hot-pot-757-colonial-heights';

function generateCalendarLinks(data) {
    const start = data.expectedDate.toISOString().replace(/-|:|\.\d\d\d/g, '');
    const end = new Date(data.expectedDate.getTime() + 2 * 60 * 60 * 1000)
        .toISOString()
        .replace(/-|:|\.\d\d\d/g, '');

    const title = encodeURIComponent(`📅 Appointment at ${data.merchantName}`);
    const details = encodeURIComponent(`Confirmation code: ${data.couponCode}\n\nPlease present this code when you arrive.`);
    const location = encodeURIComponent(data.address || '');

    return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${location}`,
    };
}

async function main() {
    console.log(`🚀 Starting FULL CAMPAIGN for ${MERCHANT_SLUG}`);
    const supabase = createClient(supabaseUrl, supabaseKey);
    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        // 1. Get Merchant
        const { data: merchant } = await supabase.from('merchants').select('id, name').eq('slug', MERCHANT_SLUG).single();
        if (!merchant) throw new Error('Merchant not found');

        const merchantData = {
            name: 'Hot Pot 757 Colonial Heights',
            address: '1042 Temple Ave, Colonial Heights, VA 23834',
            phone: '(804) 805-8363',
            slug: MERCHANT_SLUG
        };

        // 2. Fetch Recipients
        const { data: coupons } = await supabase
            .from('coupons')
            .select('id, code, status, user_id')
            .eq('merchant_id', merchant.id)
            .neq('status', 'redeemed');

        const userIds = [...new Set(coupons.map(c => c.user_id).filter(Boolean))];
        const { data: users } = await supabase
            .from('users')
            .select('id, email, name, phone')
            .in('id', userIds)
            .not('email', 'is', null);

        const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
        const recipients = coupons.map(coupon => {
            const user = userMap[coupon.user_id];
            if (!user) return null;
            return {
                code: coupon.code,
                email: user.email,
                name: user.name || 'Customer',
                userId: user.id
            };
        }).filter(Boolean);

        console.log(`📊 Found ${recipients.length} eligible recipients.`);

        const report = {
            total: recipients.length,
            success: 0,
            fail: 0,
            details: []
        };

        // 3. Loop and Send
        for (let i = 0; i < recipients.length; i++) {
            const r = recipients[i];
            console.log(`[${i + 1}/${recipients.length}] Sending to ${r.email}...`);

            try {
                const confirmationData = {
                    merchantName: merchantData.name,
                    couponCode: r.code,
                    expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    address: merchantData.address,
                    phone: merchantData.phone,
                    merchantSlug: merchantData.slug
                };

                // Generate ICS
                const calendar = ical({
                    name: 'UpDeal Reservation',
                    method: ICalCalendarMethod.PUBLISH,
                });

                calendar.createEvent({
                    start: confirmationData.expectedDate,
                    end: new Date(confirmationData.expectedDate.getTime() + 2 * 60 * 60 * 1000),
                    summary: `📅 Appointment at ${confirmationData.merchantName}`,
                    description: `Confirmation code: ${r.code}\n\nPlease present this code when you arrive.`,
                    location: confirmationData.address,
                    busystatus: ICalEventBusyStatus.BUSY,
                    organizer: {
                        name: confirmationData.merchantName,
                        email: 'info@hiraccoon.com',
                    },
                    attendees: [{ name: r.name, email: r.email }]
                });

                const icsContent = calendar.toString();

                const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hot Pot 757 Colonial Heights - Visit Reminder</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Friendly reminder — your Free Boba Tea reward at <strong>${confirmationData.merchantName}</strong> will expire soon!
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${r.code}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you visit. Add this reminder to your calendar:
      </p>

      <div style="margin: 20px 0;">
        <a href="${generateCalendarLinks(confirmationData).google}"
           style="display: inline-block; background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
           Add to Calendar
        </a>
      </div>

      <p style="color: #666; font-size: 13px; margin: 20px 0;">
        Location: ${confirmationData.address}<br>
        Phone: ${confirmationData.phone}<br>
        Link: <a href="https://hiraccoon.com/${confirmationData.merchantSlug}">https://hiraccoon.com/${confirmationData.merchantSlug}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder. Please keep this email for your records.
      </p>
    </div>
  `;

                await transporter.sendMail({
                    from: '"Hot Pot 757" <info@hiraccoon.com>',
                    to: r.email,
                    subject: `Hot Pot 757 Colonial Heights - Visit Reminder`,
                    html: html,
                    attachments: [{ filename: 'reservation.ics', content: icsContent, contentType: 'application/ics' }]
                });

                report.success++;
                report.details.push({ email: r.email, status: 'SUCCESS' });

            } catch (err) {
                console.error(`❌ Failed for ${r.email}:`, err.message);
                report.fail++;
                report.details.push({ email: r.email, status: 'FAIL', error: err.message });
            }

            // Small delay to be polite to Aliyun
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        console.log('\n--- FINAL REPORT ---');
        console.log(`Total: ${report.total}`);
        console.log(`Success: ${report.success}`);
        console.log(`Fail: ${report.fail}`);
        console.log('--------------------\n');

        // Output details for user (CSV style or JSON)
        console.log('Recipient status details:');
        report.details.forEach(d => {
            console.log(`${d.email}\t${d.status}${d.error ? `\t(${d.error})` : ''}`);
        });

    } catch (err) {
        console.error('🔥 FATAL ERROR:', err);
    }
}

main();
