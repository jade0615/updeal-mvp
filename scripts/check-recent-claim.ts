
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecentClaim() {
    console.log('Fetching most recent coupon claim (last 10 minutes)...');

    // Fetch the most recent coupon
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select(`
      code,
      created_at,
      email_sent_stage,
      status,
      referred_by,
      users (
        phone,
        email,
        name
      ),
      merchants (
        name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error('Error fetching coupon:', error);
        return;
    }

    if (!coupons || coupons.length === 0) {
        console.log('No recent coupons found.');
        return;
    }

    const coupon = coupons[0] as any;
    console.log('Latest Coupon Claim:');
    console.log('-----------------------------------');
    console.log(`Code: ${coupon.code}`);
    console.log(`Created At: ${new Date(coupon.created_at).toLocaleString()}`);

    // Handle array or object structure for joins
    const user = Array.isArray(coupon.users) ? coupon.users[0] : coupon.users;
    const merchant = Array.isArray(coupon.merchants) ? coupon.merchants[0] : coupon.merchants;

    console.log(`User Phone: ${user?.phone}`);
    console.log(`User Email: ${user?.email}`);
    console.log(`Merchant: ${merchant?.name}`);
    console.log(`Email Sent Stage: ${coupon.email_sent_stage} (0=Not Sent, 1=Sent T0)`);
    console.log(`Referral Code (Referred By): ${coupon.referred_by || 'None'}`);
    console.log('-----------------------------------');

    if (coupon.email_sent_stage === 0) {
        console.log('⚠️  Email NOT marked as sent in DB.');
        console.log('Possible reasons:');
        console.log('1. User did not provide email.');
        console.log('2. User did not provide expected visit date.');
        console.log('3. Email sending failed (check server logs).');
    } else {
        console.log('✅  Email marked as SENT in DB.');
    }
}

checkRecentClaim();
