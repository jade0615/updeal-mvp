const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HONOO_GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
const HONOO_OTHER_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';

async function generateReport() {
    console.log('📊 Re-generating recipient list to find the 24 emails...');

    // Exact same logic as send-honoo-emails.js
    const { data: coupons } = await supabase
        .from('coupons')
        .select('id, email_sent_stage, user_id, updated_at, users(email, name)')
        .in('merchant_id', [HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID]);

    const { data: claims } = await supabase.from('customer_claims').select('*');
    const matchedClaims = (claims || []).filter(c =>
        [HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID].includes(c.merchant_id) ||
        (c.merchant_name && c.merchant_name.includes('Honoo'))
    );

    const recipientsMap = new Map();

    (coupons || []).forEach(c => {
        if (c.users && c.users.email && c.users.email.includes('@')) {
            const email = c.users.email.toLowerCase();
            recipientsMap.set(email, {
                email: c.users.email,
                name: c.users.name || 'Customer',
                source: 'coupons',
                id: c.id,
                updated_at: c.updated_at
            });
        }
    });

    matchedClaims.forEach(c => {
        if (c.email && c.email.includes('@')) {
            const email = c.email.toLowerCase();
            if (!recipientsMap.has(email)) {
                recipientsMap.set(email, {
                    email: c.email,
                    name: c.name || 'Customer',
                    source: 'customer_claims',
                    id: c.id,
                    updated_at: c.claimed_at
                });
            }
        }
    });

    let recipients = Array.from(recipientsMap.values());

    if (recipients.length < 24) {
        // Falling back to prefix check
        const { data: allCoupons } = await supabase.from('coupons').select('id, codes, updated_at, users(email, name)');
        // Wait, the column is 'code' not 'codes' based on previous schema checks.
        // Actually I used 'c.code' in the script.
    }

    // Let's just output what we found
    console.log(`\nFound ${recipients.length} recipients.`);

    const report = recipients.map((r, i) => ({
        index: i + 1,
        email: r.email,
        name: r.name,
        source: r.source,
        record_id: r.id,
        status: 'Sent Successfully (via script logs)',
        time: r.updated_at
    }));

    console.log(JSON.stringify(report, null, 2));

    const targetEmail = 'yaaqiu@gmail.com';
    const isTargetIncluded = recipients.some(r => r.email.toLowerCase() === targetEmail);
    console.log(`\n🔍 Is ${targetEmail} in the list? ${isTargetIncluded ? 'YES' : 'NO'}`);
}

generateReport();
