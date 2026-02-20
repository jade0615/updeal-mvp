const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';

async function scavenger() {
    console.log('🔍 Refined scavenger hunt for Honoo customers...');

    // 1. Get sample from customer_claims and print structure precisely
    const { data: claims } = await supabase.from('customer_claims').select('*').limit(3);
    console.log('--- customer_claims sample ---');
    console.log(JSON.stringify(claims, null, 2));

    // 2. Search for Honoo Glen Allen ID in customer_claims
    if (claims && claims.length > 0) {
        const keys = Object.keys(claims[0]);
        for (const key of keys) {
            const { count } = await supabase.from('customer_claims').select('*', { count: 'exact', head: true }).eq(key, GLEN_ALLEN_ID);
            if (count > 0) console.log(`[customer_claims] Found ${count} matches in column: ${key}`);
        }
    }

    // 3. Search for Honoo Glen Allen ID in coupons
    const { data: coupons } = await supabase.from('coupons').select('*').limit(1);
    if (coupons && coupons.length > 0) {
        const keys = Object.keys(coupons[0]);
        for (const key of keys) {
            try {
                const { count } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq(key, GLEN_ALLEN_ID);
                if (count > 0) console.log(`[coupons] Found ${count} matches in column: ${key}`);
            } catch (e) { }
        }
    }
}

scavenger();
