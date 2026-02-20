
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const MERCHANT_SLUG = 'honoo-ramen-bar-1';

    const { data: merchant, error: mError } = await supabase
        .from('merchants')
        .select('id, name')
        .eq('slug', MERCHANT_SLUG)
        .single();

    if (mError || !merchant) {
        console.error('Merchant not found');
        return;
    }

    console.log(`Checking unredeemed coupons for: ${merchant.name} (${merchant.id})`);

    const { data: coupons, error: cError } = await supabase
        .from('coupons')
        .select(`
            id,
            status,
            user_id,
            users (
                email,
                name
            )
        `)
        .eq('merchant_id', merchant.id)
        .neq('status', 'redeemed');

    if (cError) {
        console.error('Error fetching coupons:', cError);
        return;
    }

    const unredeemed = coupons.map((c) => ({
        id: c.id,
        email: c.users?.email,
        name: c.users?.name,
        status: c.status
    })).filter(u => u.email);

    console.log(`Found ${unredeemed.length} unredeemed coupons with emails.`);
    unredeemed.forEach((u, i) => {
        console.log(`${i + 1}. ${u.name} <${u.email}> (${u.status})`);
    });
}

main();
