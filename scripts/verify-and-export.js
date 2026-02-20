const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TARGET_EMAIL = 'yaaqiu@gmail.com';

async function verify() {
    console.log(`🔍 Verifying status for ${TARGET_EMAIL}...`);

    // 1. Check coupons
    const { data: coupons, error: cError } = await supabase
        .from('coupons')
        .select('*, users(email, name)')
        .order('updated_at', { ascending: false });

    const targetCoupons = (coupons || []).filter(c => c.users && c.users.email && c.users.email.toLowerCase() === TARGET_EMAIL.toLowerCase());

    console.log(`\n--- ${TARGET_EMAIL} in Coupons ---`);
    if (targetCoupons.length > 0) {
        targetCoupons.forEach(c => {
            console.log(`ID: ${c.id}, Status: ${c.status}, Sent Stage: ${c.email_sent_stage}, Updated: ${c.updated_at}`);
        });
    } else {
        console.log('No coupon found for this email.');
    }

    // 2. Export ALL 'expiring_reminder' entries
    console.log('\n📅 Generating Report for "expiring_reminder" batch...');
    const sentRecords = (coupons || []).filter(c => c.email_sent_stage === 'expiring_reminder');

    const report = sentRecords.map(c => ({
        email: c.users?.email || 'Unknown',
        name: c.users?.name || 'Customer',
        coupon_id: c.id,
        status: 'Sent (Success)', // According to script logic
        sent_at: c.updated_at
    }));

    console.log(`\nTotal Sent Records: ${report.length}`);
    console.log(JSON.stringify(report, null, 2));

    // 3. Check customer_claims
    const { data: claims } = await supabase
        .from('customer_claims')
        .select('*')
        .ilike('email', TARGET_EMAIL);

    console.log(`\n--- ${TARGET_EMAIL} in Customer Claims ---`);
    console.log(JSON.stringify(claims, null, 2));
}

verify();
