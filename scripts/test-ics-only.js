
const nodemailer = require('nodemailer');
const ical = require('ical-generator').default;
const { ICalCalendarMethod, ICalEventBusyStatus } = require('ical-generator');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

async function main() {
    console.log(`🚀 Testing Aliyun SMTP with ICS attachment ONLY`);
    const transporter = nodemailer.createTransport(smtpConfig);

    try {
        const calendar = ical({ name: 'Test' });
        calendar.createEvent({
            start: new Date(),
            end: new Date(Date.now() + 3600000),
            summary: 'Test Reminder',
        });

        const info = await transporter.sendMail({
            from: 'Hiraccoon <info@hiraccoon.com>',
            to: TEST_EMAIL,
            subject: `Hot Pot 757 Update`,
            html: `<p>Hello, this is a test with a calendar attachment.</p>`,
            attachments: [{ filename: 'test.ics', content: calendar.toString(), contentType: 'text/calendar' }]
        });

        console.log(`✅ Sent! Message ID: ${info.messageId}`);
    } catch (err) {
        console.error('❌ Failed:', err);
    }
}
main();
