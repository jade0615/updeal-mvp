const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log('🔍 Checking customer_claims schema...');
    const { data: claims, error: claimsError } = await supabase.from('customer_claims').select('*').limit(1);
    if (claimsError) console.error('Claims error:', claimsError);
    else console.log('Claims columns:', Object.keys(claims[0] || {}));

    console.log('\n🔍 Checking coupons schema...');
    const { data: coupons, error: couponsError } = await supabase.from('coupons').select('*').limit(1);
    if (couponsError) console.error('Coupons error:', couponsError);
    else console.log('Coupons columns:', Object.keys(coupons[0] || {}));
}

checkSchema();
