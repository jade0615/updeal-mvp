const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findHonoo() {
    console.log('🔍 Comprehensive Honoo Search...');

    // 1. Check ALL merchants again, maybe I missed a second Honoo?
    const { data: merchants } = await supabase.from('merchants').select('*').ilike('name', '%Honoo%');
    console.log('Merchants containing "Honoo":', JSON.stringify(merchants, null, 2));

    // 2. Fetch some coupons and check if any merchant name is inside
    const { data: coupons } = await supabase.from('coupons').select('*, users(email, name)').limit(500);
    const honooCoupons = coupons.filter(c => JSON.stringify(c).includes('Honoo'));
    console.log(`\nFiltered Honoo coupons from sample: ${honooCoupons.length}`);
    if (honooCoupons.length > 0) {
        console.log('Sample matching coupon merchant_id:', honooCoupons[0].merchant_id);
    }

    // 3. Check customer_claims for ANY "Honoo"
    const { data: claims } = await supabase.from('customer_claims').select('*').limit(500);
    const honooClaims = claims.filter(c => JSON.stringify(c).includes('Honoo'));
    console.log(`\nFiltered Honoo claims from sample: ${honooClaims.length}`);
    if (honooClaims.length > 0) {
        console.log('Sample matching claim merchant_id:', honooClaims[0].merchant_id);
        console.log('Sample matching claim email:', honooClaims[0].email);
    }
}

findHonoo();
