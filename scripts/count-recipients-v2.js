
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

async function main() {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: merchant } = await supabase.from('merchants').select('id, name').eq('slug', 'hot-pot-757-colonial-heights').single();
    if (!merchant) {
        console.error('Merchant not found');
        return;
    }
    console.log(`Merchant: ${merchant.name} (${merchant.id})`);

    // 1. Get coupons (Using correct column 'code')
    const { data: coupons, error: e1 } = await supabase
        .from('coupons')
        .select('id, code, status, user_id')
        .eq('merchant_id', merchant.id)
        .neq('status', 'redeemed');

    if (e1) { console.error('Error coupons:', e1); return; }
    console.log(`Found ${coupons.length} unredeemed coupons.`);

    // 2. Get users for these unique user_ids
    const userIds = [...new Set(coupons.map(c => c.user_id).filter(Boolean))];
    if (userIds.length === 0) {
        console.log('No users found for these coupons.');
        return;
    }

    const { data: users, error: e2 } = await supabase
        .from('users')
        .select('id, email, name, phone')
        .in('id', userIds)
        .not('email', 'is', null);

    if (e2) { console.error('Error users:', e2); return; }

    // 3. Map everything together
    const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

    const recipients = coupons.map(coupon => {
        const user = userMap[coupon.user_id];
        if (!user) return null;
        return {
            coupon_id: coupon.id,
            code: coupon.code,
            status: coupon.status,
            email: user.email,
            name: user.name || 'Customer',
            phone: user.phone
        };
    }).filter(Boolean);

    console.log(`Final eligible recipients: ${recipients.length}`);
    if (recipients.length > 0) {
        console.log('Sample recipient:', JSON.stringify(recipients[0], null, 2));
    }
}
main();
