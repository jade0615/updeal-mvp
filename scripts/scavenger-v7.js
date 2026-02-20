const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function finalSearch() {
    console.log('🔍 Final thorough search for Honoo data...');

    // 1. Get all merchant IDs for Honoo
    const { data: merchants } = await supabase.from('merchants').select('id, name').ilike('name', '%Honoo%');
    const ids = (merchants || []).map(m => m.id);
    console.log('Merchant IDs to check:', ids);

    if (ids.length === 0) return;

    // 2. Check coupons for ALL these IDs
    const { data: coupons } = await supabase.from('coupons').select('*, users(email, name)').in('merchant_id', ids);
    console.log(`- Total coupons across all Honoo IDs: ${coupons?.length || 0}`);
    if (coupons && coupons.length > 0) {
        const users = coupons.map(c => c.users).filter(u => u && u.email);
        console.log(`- Users with email: ${users.length}`);
        console.log('Recipient 1:', users[0].email);
    }

    // 3. Check customer_claims for ALL these IDs
    // Since we suspect the column name might be merchant_id or similar, we check what we can.
    // Based on previous check-schema, customer_claims HAS merchant_id.
    const { data: claims } = await supabase.from('customer_claims').select('*').in('merchant_id', ids);
    console.log(`- Total claims across all Honoo IDs: ${claims?.length || 0}`);
    if (claims && claims.length > 0) {
        console.log('Recipient 1 (from claims):', claims[0].email);
    }
}

finalSearch();
