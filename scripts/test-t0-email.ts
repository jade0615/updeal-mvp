import dotenv from 'dotenv';
import path from 'path';

// 1. Force load .env.local FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testT0Email() {
    console.log('🚀 Sending Test T0 Email (Calendar Link Check)...');

    // 2. NOW dynamic import the email library so it sees the Env Vars
    const { sendT0Confirmation } = await import('../src/lib/email');

    // Use the authorized sender as the recipient for testing
    const testEmail = process.env.ALIYUN_SMTP_USER;

    console.log('Debug: SMTP User:', testEmail);
    console.log('Debug: SMTP Host:', process.env.ALIYUN_SMTP_HOST);

    if (!testEmail) {
        console.error('❌ ALIYUN_SMTP_USER not found in environment');
        return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 7:00 PM

    try {
        const result = await sendT0Confirmation({
            email: testEmail,
            merchantName: "Best Buffet (Test)",
            couponCode: "TEST-SHARE-FINAL",
            expectedDate: tomorrow,
            address: "123 Delicious Ave, Food City",
            merchantSlug: "best-buffet"
        });

        if (result.success) {
            console.log(`✅ T0 Email sent successfully to ${testEmail}!`);
            console.log('👉 Please check your inbox for the new "Share" buttons.');
        } else {
            console.error('❌ Failed to send T0 email:', result.error);
        }
    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testT0Email();
