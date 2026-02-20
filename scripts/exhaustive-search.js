const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findRaw() {
    console.log('🔍 Searching ALL tables for yaaqiu...');

    const tables = ['users', 'coupons', 'customer_claims'];
    for (const table of tables) {
        let { data, error } = await supabase.from(table).select('*');
        if (data) {
            const matches = data.filter(row => JSON.stringify(row).toLowerCase().includes('yaaqiu'));
            console.log(`\nTable ${table}: found ${matches.length} matches.`);
            if (matches.length > 0) {
                console.log(JSON.stringify(matches, null, 2));
            }
        }
    }
}

findRaw();
