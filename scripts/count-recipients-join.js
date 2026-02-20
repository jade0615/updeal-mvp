
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: merchant } = await supabase.from('merchants').select('id, name').eq('slug', 'hot-pot-757-colonial-heights').single();
    if (!merchant) {
        console.error('Merchant not found');
        return;
    }
    console.log(`Merchant: ${merchant.name} (${merchant.id})`);

    // Fetch coupons joined with claims and users
    const { data: claims, error } = await supabase
        .from('coupon_claims')
        .select(`
            id,
            user_id,
            coupon_id,
            coupons (
                confirmation_code,
                status
            ),
            users (
                email,
                id,
                phone
            )
        `)
        .eq('merchant_id', merchant.id);

    if (error) {
        console.error('Error fetching claims:', error);
        return;
    }

    // Filter for those with valid email and active coupon
    const recipients = claims.filter(c => c.users?.email && c.coupons?.status !== 'redeemed');

    console.log(`Found ${claims.length} total claims for this merchant.`);
    console.log(`Found ${recipients.length} eligible recipients (with email and unredeemed coupon).`);

    if (recipients.length > 0) {
        console.log('Sample recipient:', JSON.stringify(recipients[0], null, 2));
    }
}
main();
