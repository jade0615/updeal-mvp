const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findData() {
    console.log('🔍 Searching all merchants for Honoo...');
    const { data: merchants } = await supabase.from('merchants').select('id, name, slug').ilike('name', '%Honoo%');
    console.log('Honoo Merchants:', merchants);

    if (merchants && merchants.length > 0) {
        for (const m of merchants) {
            console.log(`\nChecking merchant ${m.name} (${m.id})...`);
            const { count } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', m.id);
            console.log(`- Coupons count: ${count}`);

            const { count: claimCount } = await supabase.from('customer_claims').select('*', { count: 'exact', head: true }).eq('merchant_id', m.id);
            console.log(`- Customer claims count: ${claimCount}`);
        }
    }

    console.log('\n🔍 Checking for any coupon with Honoo in merchant info (if denormalized)...');
    // Some tables might have merchant_name or similar
}

findData();
