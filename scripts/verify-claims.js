const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HONOO_ID = '355f30e0-c977-4ae6-8052-a5494f693240';

async function verify() {
    console.log('🔍 Verifying customer_claims for Honoo...');
    const { data: claims, error } = await supabase
        .from('customer_claims')
        .select('*')
        .eq('merchant_id', HONOO_ID)
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Found claims:', claims.length);
        console.log('Full first claim:', JSON.stringify(claims[0], null, 2));
    }
}

verify();
