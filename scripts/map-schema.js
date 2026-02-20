
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get columns for coupon_claims
    const { data: claim } = await supabase.from('coupon_claims').select('*').limit(1).single();
    if (claim) console.log('coupon_claims:', Object.keys(claim).join(', '));

    // Get columns for users
    const { data: user } = await supabase.from('users').select('*').limit(1).single();
    if (user) console.log('users:', Object.keys(user).join(', '));

    // Get columns for coupons
    const { data: coupon } = await supabase.from('coupons').select('*').limit(1).single();
    if (coupon) console.log('coupons:', Object.keys(coupon).join(', '));
}
main();
