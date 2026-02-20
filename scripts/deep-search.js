const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HONOO_MERCHANT_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';

async function deepSearch() {
    console.log('🔍 Deep searching for Honoo customers...');

    // 1. Check coupons table
    console.log('\nChecking coupons table...');
    const { data: coupons, error: cError } = await supabase
        .from('coupons')
        .select('*, users(email, name)')
        .eq('merchant_id', HONOO_MERCHANT_ID);

    if (cError) console.error('Coupons error:', cError);
    else console.log(`Found ${coupons.length} coupons for Honoo.`);

    // 2. Check users who might have claimed something
    if (coupons && coupons.length > 0) {
        const users = coupons.map(c => c.users).filter(u => u && u.email);
        console.log('Sample users from coupons:', users.slice(0, 3));
    }

    // 3. Check customer_claims again but list a few rows to see content
    console.log('\nChecking sample of customer_claims...');
    const { data: claims } = await supabase.from('customer_claims').select('*').limit(5);
    console.log('Sample claims:', JSON.stringify(claims, null, 2));
}

deepSearch();
