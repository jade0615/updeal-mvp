const nodemailer = require('nodemailer');

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

const targetEmail = 'yaaqiu@gmail.com';

async function sendTest() {
    console.log(`📧 Sending test email to ${targetEmail}...`);
    try {
        const info = await transporter.sendMail({
            from: 'Honoo Ramen Bar <info@hiraccoon.com>',
            to: targetEmail,
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
        console.log(`✅ Success! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`❌ Failed to send:`, error);
    }
}

sendTest();
