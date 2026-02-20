const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HONOO_GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';

async function hunt() {
    console.log('🔍 Hunting for Honoo customer data...');

    // 1. Any claims with emails for this merchant?
    const { data: claimsWithEmail } = await supabase
        .from('customer_claims')
        .select('*')
        .eq('merchant_id', HONOO_GLEN_ALLEN_ID)
        .not('email', 'is', null);

    console.log(`- Customer claims with email: ${claimsWithEmail?.length || 0}`);
    if (claimsWithEmail && claimsWithEmail.length > 0) {
        console.log('Sample claim email:', claimsWithEmail[0].email);
    }

    // 2. Any users at all?
    const { data: users } = await supabase.from('users').select('*').limit(5);
    console.log('\nChecking users table structure...');
    console.log('User sample:', JSON.stringify(users, null, 2));

    // 3. Any coupons?
    const { data: coupons } = await supabase
        .from('coupons')
        .select('id, user_id, contact_email, contact_name')
        .eq('merchant_id', HONOO_GLEN_ALLEN_ID)
        .limit(10);

    console.log('\nCoupons sample rows (Glen Allen):', JSON.stringify(coupons, null, 2));
}

hunt();
