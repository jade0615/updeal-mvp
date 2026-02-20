const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkEnum() {
    console.log('🔍 Checking unique email_sent_stage values...');
    const { data, error } = await supabase.from('coupons').select('email_sent_stage');

    if (error) {
        console.error(error);
        return;
    }

    const stages = new Set();
    data.forEach(r => {
        if (r.email_sent_stage) stages.add(r.email_sent_stage);
    });

    console.log('Unique stages found:', Array.from(stages));

    // Also check for any record updated in the last 1 hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { data: recent } = await supabase.from('coupons').select('*, users(email)').gt('updated_at', oneHourAgo);
    console.log(`\nFound ${recent?.length || 0} records updated in the last hour.`);
    if (recent && recent.length > 0) {
        console.log('Sample recent update:', JSON.stringify(recent[0], null, 2));
    }
}

checkEnum();
