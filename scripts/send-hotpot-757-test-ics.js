
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

async function main() {
    console.log(`🚀 Starting Test Send with ADJUSTED BODY for ${MERCHANT_SLUG}`);
    console.log(`🎯 Target: ${TEST_EMAIL}`);

    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        const code = 'UQ8V9K';
        console.log(`✅ Using Confirmation Code: ${code}`);

        // 1. Generate ICS
        const calendar = ical({
            name: 'Hot Pot 757 Reminder',
            method: ICalCalendarMethod.PUBLISH,
        });

        const startTime = new Date();
        startTime.setDate(startTime.getDate() + 7);
        startTime.setHours(18, 0, 0, 0);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

        calendar.createEvent({
            start: startTime,
            end: endTime,
            summary: `Reminder: Your Free Boba Tea coupon is expiring soon!`,
            description: `Confirmation code: ${code}\n\nDon't miss out on your Free Boba Tea! Show this code at the store.`,
            location: `1042 Temple Ave, Colonial Heights, VA 23834`,
            busystatus: ICalEventBusyStatus.BUSY,
            organizer: {
                name: 'Hot Pot 757 Colonial Heights',
                email: 'info@hiraccoon.com'
            }
        });

        const icsContent = calendar.toString();

        // 2. Prepare Adjusted Email Body (Removing known triggers)
        const html = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                <p>Hi there,</p>
                <p>Friendly reminder — your Free Boba Tea reward at Hot Pot 757 Colonial Heights is expiring soon. We look forward to seeing you at the store.</p>
                
                <p style="font-size: 18px; margin: 20px 0;">🎫 Your Confirmation Code: <strong>${code}</strong></p>

                <p>🎟️ Added to Apple Wallet? Check your Wallet app — your reward is available to use!</p>
                
                <p>Visit us at:</p>
                
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #e63946;">
                    <strong>📍 Hot Pot 757 Colonial Heights</strong><br>
                    📫 1042 Temple Ave, Colonial Heights, VA 23834<br>
                    📞 (804) (805)-8363
                </div>
                
                <p>🔗 View your reward: <a href="https://hiraccoon.com/hot-pot-757-colonial-heights" style="color: #e63946; text-decoration: none; font-weight: bold;">https://hiraccoon.com/hot-pot-757-colonial-heights</a></p>
                
                <p>We look forward to seeing you!</p>
                
                <p>Best regards,<br>
                Hot Pot 757 Colonial Heights</p>
            </div>
        `;

        const subject = `Hot Pot 757 Colonial Heights - Important Update`;
        console.log(`📤 Attempting with subject: ${subject}`);

        const info = await transporter.sendMail({
            from: '"Hot Pot 757 Colonial Heights" <info@hiraccoon.com>',
            to: TEST_EMAIL,
            subject: subject,
            html: html,
            attachments: [
                {
                    filename: 'reminder.ics',
                    content: icsContent,
                    contentType: 'text/calendar',
                }
            ]
        });
        console.log(`✅ Sent successfully! Message ID: ${info.messageId}`);

    } catch (err) {
        console.error('🔥 ERROR:', err.message);
        if (err.responseCode === 554) {
            console.log('❌ Aliyun still flagging as spam. Body needs more simplification.');
        }
    }
}

main();
