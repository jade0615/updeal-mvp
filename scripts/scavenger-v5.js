const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findHonooPaginated() {
    console.log('🔍 paginated search for Honoo in ALL coupons...');

    let allHonooCoupons = [];
    let from = 0;
    let to = 999;
    let finished = false;

    while (!finished) {
        console.log(`Checking coupons ${from} to ${to}...`);
        const { data, error } = await supabase.from('coupons').select('*, users(email, name)').range(from, to);
        if (error || !data || data.length === 0) {
            finished = true;
            break;
        }

        const filtered = data.filter(c => JSON.stringify(c).includes('Honoo'));
        allHonooCoupons.push(...filtered);

        if (data.length < 1000) finished = true;
        from += 1000;
        to += 1000;
    }

    console.log(`\n✅ Total Honoo coupons found: ${allHonooCoupons.length}`);
    if (allHonooCoupons.length > 0) {
        console.log('Merchant ID from coupon:', allHonooCoupons[0].merchant_id);
    }
}

findHonooPaginated();
