const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findHonooClaimsPaginated() {
    console.log('🔍 paginated search for Honoo in ALL customer_claims...');

    let allHonooClaims = [];
    let from = 0;
    let to = 999;
    let finished = false;

    while (!finished) {
        console.log(`Checking claims ${from} to ${to}...`);
        const { data, error } = await supabase.from('customer_claims').select('*').range(from, to);
        if (error || !data || data.length === 0) {
            finished = true;
            break;
        }

        const filtered = data.filter(c => JSON.stringify(c).includes('Honoo'));
        allHonooClaims.push(...filtered);

        if (data.length < 1000) finished = true;
        from += 1000;
        to += 1000;
    }

    console.log(`\n✅ Total Honoo claims found: ${allHonooClaims.length}`);
    if (allHonooClaims.length > 0) {
        console.log('Sample claim:', JSON.stringify(allHonooClaims[0], null, 2));
    }
}

findHonooClaimsPaginated();
