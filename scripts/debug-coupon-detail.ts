import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function debugCoupon() {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', 'HOTP-BHA2')
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Complete Coupon Details:');
    console.log(JSON.stringify(data, null, 2));

    console.log('\n📧 Email Sending Diagnosis:');
    console.log(`Expected Visit Date: ${data.expected_visit_date || 'NOT PROVIDED ❌'}`);
    console.log(`Email Sent Stage: ${data.email_sent_stage}`);

    if (!data.expected_visit_date) {
        console.log('\n⚠️  ROOT CAUSE: User did not select/provide expected visit date!');
        console.log('The frontend form requires BOTH email AND visit date for T0 email to be sent.');
    } else if (data.email_sent_stage === 0) {
        console.log('\n❌ PROBLEM: Visit date was provided but email still failed to send.');
        console.log('Check Vercel runtime logs for sendT0Confirmation errors.');
    }
}

debugCoupon();
