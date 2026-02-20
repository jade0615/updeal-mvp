const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
const OTHER_HONOO_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';

async function ultimateScavenger() {
    console.log('🔍 Ultimate Scavenger Hunt...');

    const ids = [GLEN_ALLEN_ID, OTHER_HONOO_ID];

    // Check customer_claims with manual filtering of 1000 rows
    const { data: claims } = await supabase.from('customer_claims').select('*').limit(1000);
    const matchedClaims = claims.filter(c => ids.includes(c.merchant_id));
    console.log(`Matched claims in 1000 sample: ${matchedClaims.length}`);
    if (matchedClaims.length > 0) console.log('Sample Claim:', matchedClaims[0]);

    // Check coupons with manual filtering of 1000 rows
    const { data: coupons } = await supabase.from('coupons').select('*, users(email, name)').limit(1000);
    const matchedCoupons = coupons.filter(c => ids.includes(c.merchant_id));
    console.log(`Matched coupons in 1000 sample: ${matchedCoupons.length}`);
    if (matchedCoupons.length > 0) console.log('Sample Coupon User:', matchedCoupons[0].users);
}

ultimateScavenger();
