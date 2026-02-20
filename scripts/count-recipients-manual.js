
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

    // 1. Get coupons
    const { data: coupons, error: e1 } = await supabase
        .from('coupons')
        .select('id, confirmation_code, status')
        .eq('merchant_id', merchant.id);

    if (e1) { console.error('Error coupons:', e1); return; }
    console.log(`Found ${coupons.length} coupons.`);

    // 2. Get claims for these coupons
    const couponIds = coupons.map(c => c.id);
    const { data: claims, error: e2 } = await supabase
        .from('coupon_claims')
        .select('user_id, coupon_id')
        .in('coupon_id', couponIds);

    if (e2) { console.error('Error claims:', e2); return; }
    console.log(`Found ${claims.length} claims.`);

    // 3. Get users for these claims
    const userIds = [...new Set(claims.map(c => c.user_id))];
    const { data: users, error: e3 } = await supabase
        .from('users')
        .select('id, email, phone')
        .in('id', userIds);

    if (e3) { console.error('Error users:', e3); return; }
    console.log(`Found ${users.length} users.`);

    // 4. Map everything together
    const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});
    const claimMap = claims.reduce((acc, c) => { acc[c.coupon_id] = c; return acc; }, {});

    const recipients = coupons.map(coupon => {
        const claim = claimMap[coupon.id];
        const user = claim ? userMap[claim.user_id] : null;
        return {
            ...coupon,
            email: user ? user.email : null,
            phone: user ? user.phone : null,
            userId: user ? user.id : null
        };
    }).filter(r => r.email && r.status !== 'redeemed');

    console.log(`Final eligible recipients: ${recipients.length}`);
    if (recipients.length > 0) {
        console.log('Sample recipient:', JSON.stringify(recipients[0], null, 2));
    }
}
main();
