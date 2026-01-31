
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkLatestClaim() {
    console.log('Checking latest coupon claim...');

    const { data: coupon, error } = await supabase
        .from('coupons')
        .select(`
            *,
            users (id, phone, email, name)
        `)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching coupon:', error);
        return;
    }

    console.log('--- Latest Claim ---');
    console.log(`Created At: ${new Date(coupon.created_at).toLocaleString()}`);
    console.log(`User Phone: ${coupon.users?.phone}`);
    console.log(`User Email: "${coupon.users?.email}"`); // Quotes to see trailing spaces/typos
    console.log(`Coupon Code: ${coupon.code}`);
    console.log(`Email Sent Stage: ${coupon.email_sent_stage} (0=Pending, 1=Sent)`);
    console.log(`Expected Visit: ${coupon.expected_visit_date}`);
}

checkLatestClaim();
