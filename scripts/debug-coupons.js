
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: merchant } = await supabase.from('merchants').select('id').eq('slug', 'hot-pot-757-colonial-heights').single();
    if (!merchant) {
        console.log('Merchant not found');
        return;
    }
    console.log('Merchant ID:', merchant.id);
    const { data: coupons, error } = await supabase.from('coupons').select('confirmation_code, status').eq('merchant_id', merchant.id).limit(5);
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Coupons:', JSON.stringify(coupons, null, 2));
}
main();
