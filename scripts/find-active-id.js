const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findLatest() {
    console.log('🔍 Checking latest 100 coupons...');
    const { data: coupons } = await supabase.from('coupons').select('merchant_id').order('created_at', { ascending: false }).limit(100);
    const uniqueIds = [...new Set((coupons || []).map(c => c.merchant_id))];
    console.log('Recent Merchant IDs in coupons:', uniqueIds);

    for (const id of uniqueIds) {
        const { data: m } = await supabase.from('merchants').select('name').eq('id', id).single();
        if (m && m.name.includes('Honoo')) {
            console.log(`✅ MATCH! Merchant ${m.name} has ID: ${id}`);
        }
    }

    console.log('\n🔍 Checking latest 100 claims...');
    const { data: claims } = await supabase.from('customer_claims').select('merchant_id').order('claimed_at', { ascending: false }).limit(100);
    const uniqueClaimIds = [...new Set((claims || []).map(c => c.merchant_id))];
    console.log('Recent Merchant IDs in claims:', uniqueClaimIds);
}

findLatest();
