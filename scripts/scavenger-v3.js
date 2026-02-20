const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';

async function scavenger() {
    console.log('🔍 Scavenger hunt v3 for Honoo customers...');

    // 1. Search coupons for the merchant ID
    const { data: coupons } = await supabase
        .from('coupons')
        .select('*, users!inner(email, name)')
        .eq('merchant_id', GLEN_ALLEN_ID);

    console.log(`[coupons] Found ${coupons?.length || 0} coupons for Glen Allen.`);
    if (coupons && coupons.length > 0) {
        console.log('Sample user email:', coupons[0].users.email);
    }

    // 2. If no inner join, try separate fetch
    const { data: couponsOnly } = await supabase.from('coupons').select('user_id').eq('merchant_id', GLEN_ALLEN_ID);
    console.log(`[coupons only] Found ${couponsOnly?.length || 0} coupons.`);

    if (couponsOnly && couponsOnly.length > 0) {
        const userIds = [...new Set(couponsOnly.map(c => c.user_id).filter(Boolean))];
        console.log(`Unique user IDs: ${userIds.length}`);
        const { data: users } = await supabase.from('users').select('email').in('id', userIds.slice(0, 10));
        console.log('Sample users:', users);
    }
}

scavenger();
