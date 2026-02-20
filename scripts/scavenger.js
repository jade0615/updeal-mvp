const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vlnhnvanfzbgfnxqksln.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GLEN_ALLEN_ID = '355f30e0-c977-4ae6-8052-a5494f693240';

async function scavenger() {
    console.log('🔍 Final scavenger hunt for Honoo customers...');

    // 1. Check all columns in customer_claims
    const { data: sampleRow } = await supabase.from('customer_claims').select('*').limit(1);
    if (sampleRow && sampleRow.length > 0) {
        console.log('Actual columns in customer_claims:', Object.keys(sampleRow[0]));

        // If there's a different name for merchant_id (like store_id, or just merchant)
        const keys = Object.keys(sampleRow[0]);
        const possibleMerchantFields = keys.filter(k => k.includes('merchant') || k.includes('store') || k.includes('id'));
        console.log('Possible merchant fields:', possibleMerchantFields);
    }

    // 2. Try coupons with a raw select to see ALL columns
    console.log('\nChecking all columns in coupons...');
    const { data: couponSample } = await supabase.from('coupons').select('*').limit(1);
    if (couponSample && couponSample.length > 0) {
        console.log('Actual columns in coupons:', Object.keys(couponSample[0]));
    }

    // 3. Search for ANY record containing the HONOO ID in any likely field
    console.log('\nSearching for records with Honoo ID...');
    const tables = ['customer_claims', 'coupons', 'users'];
    for (const table of tables) {
        // This is hard to do without knowing column names, but we try standard ones
        // Or just fetch some and filter in JS
        const { data } = await supabase.from(table).select('*').limit(100);
        const matching = data?.filter(row => JSON.stringify(row).includes(GLEN_ALLEN_ID));
        console.log(`Table ${table}: found ${matching?.length || 0} rows containing ID.`);
    }
}

scavenger();
