
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    console.log('--- coupon_claims ---');
    const { data: claims, error: cError } = await supabase.from('coupon_claims').select('*').limit(1);
    if (cError) console.error(cError); else console.log('Claims Sample:', JSON.stringify(claims[0], null, 2));

    console.log('--- users ---');
    const { data: users, error: uError } = await supabase.from('users').select('*').limit(1);
    if (uError) console.error(uError); else console.log('Users Sample:', JSON.stringify(users[0], null, 2));
}
main();
