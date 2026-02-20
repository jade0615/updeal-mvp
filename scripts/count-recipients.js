
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: merchant } = await supabase.from('merchants').select('id, name').eq('slug', 'hot-pot-757-colonial-heights').single();
    if (!merchant) {
        console.error('Merchant not found');
        return;
    }
    console.log(`Merchant: ${merchant.name} (${merchant.id})`);

    const { data: coupons, error } = await supabase
        .from('coupons')
        .select('id, email, name, confirmation_code, status')
        .eq('merchant_id', merchant.id)
        .not('email', 'is', null);

    if (error) {
        console.error('Error fetching coupons:', error);
        return;
    }

    console.log(`Found ${coupons.length} coupons with email.`);

    // Group by status to see what we have
    const stats = coupons.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
    }, {});
    console.log('Stats by status:', stats);

    if (coupons.length > 0) {
        console.log('Sample record:', JSON.stringify(coupons[0], null, 2));
    }
}
main();
