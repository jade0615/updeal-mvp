const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function inspect() {
    console.log('🔍 Inspecting coupons for email_sent_stage...');

    // Check what sent stages exist
    const { data: stages } = await supabase.from('coupons').select('email_sent_stage');
    const counts = {};
    (stages || []).forEach(s => {
        const val = s.email_sent_stage || 'null';
        counts[val] = (counts[val] || 0) + 1;
    });
    console.log('Email Sent Stage counts:', counts);

    // List all records with expiring_reminder
    const { data: sent, error } = await supabase
        .from('coupons')
        .select('*, users(email, name)')
        .eq('email_sent_stage', 'expiring_reminder');

    if (error) {
        console.error('Error fetching sent records:', error);
    } else {
        console.log(`\n✅ Found ${sent.length} records marked as "expiring_reminder".`);
        const report = sent.map(s => ({
            email: s.users?.email,
            name: s.users?.name,
            coupon_id: s.id,
            updated_at: s.updated_at
        }));
        console.log(JSON.stringify(report, null, 2));
    }
}

inspect();
