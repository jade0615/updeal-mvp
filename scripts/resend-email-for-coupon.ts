import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function resendEmail() {
    console.log('🔄 Attempting to resend T0 email for coupon HOTP-BHA2...\n');

    // Get coupon details
    const { data: coupon, error: couponError } = await supabase
        .from('coupons')
        .select(`
            *,
            users (
                phone,
                email,
                name,
                id
            ),
            merchants (
                name,
                slug,
                content
            )
        `)
        .eq('code', 'HOTP-BHA2')
        .single();

    if (couponError || !coupon) {
        console.error('❌ Error fetching coupon:', couponError);
        return;
    }

    const user = coupon.users as any;
    const merchant = coupon.merchants as any;

    console.log('Coupon Details:');
    console.log(`  Code: ${coupon.code}`);
    console.log(`  User Email: ${user.email}`);
    console.log(`  Merchant: ${merchant.name}`);
    console.log(`  Expected Visit: ${coupon.expected_visit_date}\n`);

    if (!user.email) {
        console.error('❌ No email address for user');
        return;
    }

    if (!coupon.expected_visit_date) {
        console.error('❌ No expected visit date');
        return;
    }

    // Import email function
    const { sendT0Confirmation } = await import('../src/lib/email');

    // Generate referral code
    const referralCode = `REF-${user.id.substring(0, 6).toUpperCase()}`;

    console.log('📧 Sending email...');
    console.log(`  To: ${user.email}`);
    console.log(`  Referral Code: ${referralCode}\n`);

    try {
        const emailRes = await sendT0Confirmation({
            email: user.email,
            merchantName: merchant.name,
            couponCode: coupon.code,
            expectedDate: new Date(coupon.expected_visit_date),
            address: merchant.content?.address?.fullAddress || merchant.content?.location || 'See merchant for details',
            merchantSlug: merchant.slug,
            referralCode: referralCode,
            offerValue: merchant.content?.offer?.value || merchant.content?.offer_value || '50% OFF',
            offerDescription: merchant.content?.offer?.description || merchant.content?.offerDescription || 'Special offer'
        });

        console.log('Email Result:', emailRes);

        if (emailRes.success) {
            console.log('\n✅✅✅ EMAIL SENT SUCCESSFULLY!\n');

            // Update database
            await supabase
                .from('coupons')
                .update({ email_sent_stage: 1 })
                .eq('code', coupon.code);

            console.log('✅ Database updated: email_sent_stage = 1');
            console.log(`\n👉 Please check ${user.email} for the confirmation email.`);
        } else {
            console.error('\n❌❌❌ EMAIL FAILED TO SEND');
            console.error('Error:', emailRes.error);
        }
    } catch (error) {
        console.error('\n❌ Exception during email send:');
        console.error(error);
    }
}

resendEmail();
