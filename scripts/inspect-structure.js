const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspectStructure() {
    console.log('🔍 Inspecting structure of latest 50 coupons...');
    const { data, error } = await supabase.from('coupons').select('*, users(email, name)').order('created_at', { ascending: false }).limit(50);

    if (error) {
        console.error(error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]));
        console.log('Sample data (first 3):', JSON.stringify(data.slice(0, 3), null, 2));

        const honPrefix = data.filter(c => {
            const str = JSON.stringify(c).toLowerCase();
            return str.includes('"hon');
        });
        console.log(`\nFound ${honPrefix.length} rows in this sample with "HON" prefix in any field.`);
    }
}

inspectStructure();
