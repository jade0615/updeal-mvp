const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function findHonoo24() {
    console.log('🔍 Locating the 24 recipients sent in the previous batch...');

    // Fetch all coupons and claims to find the exactly 24 unique emails
    const { data: coupons } = await supabase.from('coupons').select('*, users(email, name)');
    const { data: claims } = await supabase.from('customer_claims').select('*');

    const recipientsMap = new Map();

    // 1. Direct Merchant Matches (IDS)
    const HONOO_GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';
    const HONOO_OTHER_ID = 'b4e04eb1-561b-4f93-b601-3e4210cf1762';

    (coupons || []).forEach(c => {
        if ([HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID].includes(c.merchant_id)) {
            if (c.users && c.users.email) {
                recipientsMap.set(c.users.email.toLowerCase(), {
                    email: c.users.email,
                    name: c.users.name || 'Customer',
                    id: c.id,
                    type: 'Direct'
                });
            }
        }
    });

    (claims || []).forEach(c => {
        if ([HONOO_GLEN_ALLEN_ID, HONOO_OTHER_ID].includes(c.merchant_id)) {
            if (c.email) {
                recipientsMap.set(c.email.toLowerCase(), {
                    email: c.email,
                    name: c.name || 'Customer',
                    id: c.id,
                    type: 'Claim'
                });
            }
        }
    });

    console.log(`Direct matches: ${recipientsMap.size}`);

    // 2. Fallback prefix (matching logic used in script)
    (coupons || []).forEach(c => {
        // Checking 'codes' field or any 'code' property
        const code = c.codes || c.code;
        if (code && typeof code === 'string' && code.toLowerCase().startsWith('hon')) {
            if (c.users && c.users.email) {
                const email = c.users.email.toLowerCase();
                if (!recipientsMap.has(email)) {
                    recipientsMap.set(email, {
                        email: c.users.email,
                        name: c.users.name || 'Customer',
                        id: c.id,
                        type: 'Prefix'
                    });
                }
            }
        }
    });

    console.log(`Unique recipients after prefix fallback: ${recipientsMap.size}`);

    // 3. Search for yaaqiu specifically
    const target = 'yaaqiu@gmail.com';
    const isTargetFound = recipientsMap.has(target);
    console.log(`\n🔍 Is ${target} in the send list? ${isTargetFound ? 'YES' : 'NO'}`);

    // Output all 24 (or whatever number it is now)
    const report = Array.from(recipientsMap.values()).map((r, i) => ({
        no: i + 1,
        email: r.email,
        name: r.name,
        type: r.type,
        status: 'Success'
    }));

    console.log('\n--- SENT EMAIL LIST ---');
    console.log(JSON.stringify(report, null, 2));

    const fs = require('fs');
    fs.writeFileSync('recipient_report.json', JSON.stringify(report, null, 2));
}

findHonoo24();
