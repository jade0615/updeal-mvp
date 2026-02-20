
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

const TEST_EMAIL = 'yaaqiu@gmail.com';
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
  console.log(`🚀 Starting CLONED Test Send for ${MERCHANT_SLUG}`);
  console.log(`🎯 Target: ${TEST_EMAIL}`);

  const transporter = nodemailer.createTransport(smtpConfig);

  try {
    const data = {
      merchantName: 'Hot Pot 757 Colonial Heights',
      couponCode: 'UQ8V9K',
      expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      address: '1042 Temple Ave, Colonial Heights, VA 23834',
      phone: '(804) 805-8363',
      merchantSlug: 'hot-pot-757-colonial-heights'
    };

    // 1. Generate ICS (Same logic as generateICS in lib/calendar.ts)
    const calendar = ical({
      name: 'UpDeal Reservation',
      method: ICalCalendarMethod.PUBLISH,
    });

    const startTime = data.expectedDate;
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000);

    calendar.createEvent({
      start: startTime,
      end: endTime,
      summary: `📅 Appointment at ${data.merchantName}`,
      description: `Confirmation code: ${data.couponCode}\n\nPlease present this code when you arrive.`,
      location: data.address,
      busystatus: ICalEventBusyStatus.BUSY,
      organizer: {
        name: data.merchantName,
        email: 'info@hiraccoon.com',
      },
      attendees: [
        {
          name: 'Customer', // Use actual name if available
          email: TEST_EMAIL,
        }
      ]
    });

    const icsContent = calendar.toString();

    // 2. Prepare HTML (Exact structure from src/lib/email.ts)
    const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Hot Pot 757 Colonial Heights - Visit Reminder</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Friendly reminder — your Free Boba Tea reward at <strong>${data.merchantName}</strong> will expire soon!
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you visit. Add this reminder to your calendar:
      </p>

      <div style="margin: 20px 0;">
        <a href="${generateCalendarLinks(data).google}"
           style="display: inline-block; background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
           Add to Calendar
        </a>
      </div>

      <p style="color: #666; font-size: 13px; margin: 20px 0;">
        Location: ${data.address}<br>
        Phone: ${data.phone}<br>
        Link: <a href="https://hiraccoon.com/${data.merchantSlug}">https://hiraccoon.com/${data.merchantSlug}</a>
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder. Please keep this email for your records.
      </p>
    </div>
  `;

    // 3. Send Email
    const info = await transporter.sendMail({
      from: 'Hiraccoon <info@hiraccoon.com>',
      to: TEST_EMAIL,
      subject: `Hot Pot 757 Colonial Heights - Visit Reminder`,
      html: html,
      attachments: [
        {
          filename: 'reservation.ics',
          content: icsContent,
          contentType: 'application/ics',
        },
      ],
    });

    console.log(`✅ Sent successfully! Message ID: ${info.messageId}`);

  } catch (err) {
    console.error('🔥 ERROR:', err.message);
  }
}

main();
