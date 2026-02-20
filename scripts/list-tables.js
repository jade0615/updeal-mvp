
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.rpc('get_tables'); // This might not work if no RPC
    if (error) {
        // Fallback: try common names
        const tables = ['coupons', 'coupon_claims', 'user_coupons', 'merchants', 'users'];
        for (const t of tables) {
            const { error: e } = await supabase.from(t).select('count', { count: 'exact', head: true });
            console.log(`Table ${t}: ${e ? 'ERROR' : 'OK'}`);
            if (e) console.log(e.message);
        }
    } else {
        console.log('Tables:', data);
    }
}
main();
