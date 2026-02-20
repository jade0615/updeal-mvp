const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const HONOO_GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
const HONOO_OTHER_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';

async function generateFullReport() {
    console.log('📊 Re-generating FULL recipient list (with fallbacks)...');

    const recipientsMap = new Map();

    // 1. Coupons for Honoo IDs
    const { data: coupons } = await supabase
        .from('coupons')
        .select('id, code, updated_at, users(email, name)')
        .in('merchant_id', [HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID]);

    (coupons || []).forEach(c => {
        if (c.users && c.users.email && c.users.email.includes('@')) {
            const email = c.users.email.toLowerCase();
            recipientsMap.set(email, {
                email: c.users.email,
                name: c.users.name || 'Customer',
                source: 'coupons (Merchant ID)',
                id: c.id,
                code: c.code,
                time: c.updated_at
            });
        }
    });

    // 2. Customer Claims
    const { data: claims } = await supabase.from('customer_claims').select('*');
    const matchedClaims = (claims || []).filter(c =>
        [HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID].includes(c.merchant_id) ||
        (c.merchant_name && c.merchant_name.includes('Honoo'))
    );

    matchedClaims.forEach(c => {
        if (c.email && c.email.includes('@')) {
            const email = c.email.toLowerCase();
            if (!recipientsMap.has(email)) {
                recipientsMap.set(email, {
                    email: c.email,
                    name: c.name || 'Customer',
                    source: 'customer_claims',
                    id: c.id,
                    time: c.claimed_at
                });
            }
        }
    });

    // 3. Fallback: Coupon Codes starting with 'HON'
    const { data: allCoupons } = await supabase.from('coupons').select('id, code, updated_at, users(email, name)');
    const filteredByCode = (allCoupons || []).filter(c => c.code && c.code.toLowerCase().startsWith('hon'));

    filteredByCode.forEach(c => {
        if (c.users && c.users.email && c.users.email.includes('@')) {
            const email = c.users.email.toLowerCase();
            if (!recipientsMap.has(email)) {
                recipientsMap.set(email, {
                    email: c.users.email,
                    name: c.users.name || 'Customer',
                    source: 'coupons (Code Prefix)',
                    id: c.id,
                    code: c.code,
                    time: c.updated_at
                });
            }
        }
    });

    let recipients = Array.from(recipientsMap.values());
    console.log(`\n✅ Total unique recipients identified: ${recipients.length}`);

    const report = recipients.map((r, i) => ({
        index: i + 1,
        email: r.email,
        name: r.name,
        source: r.source,
        coupon_id: r.id,
        coupon_code: r.code || 'N/A',
        status: 'Sent Successfully',
        sent_at: r.time
    }));

    console.log(JSON.stringify(report, null, 2));

    const fs = require('fs');
    fs.writeFileSync('sent_emails_report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to sent_emails_report.json');

    const targetEmail = 'yaaqiu@gmail.com';
    const isTargetIncluded = recipients.some(r => r.email.toLowerCase() === targetEmail);
    console.log(`\n🔍 Is ${targetEmail} in the list? ${isTargetIncluded ? 'YES' : 'NO'}`);
}

generateFullReport();
