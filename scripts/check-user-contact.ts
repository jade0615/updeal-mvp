
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserEmail() {
    console.log('Checking CUS-0001 data...');

    // 1. Get the coupon
    const { data: coupon, error } = await supabase
        .from('coupons')
        .select(`
            *,
            users (*),
            merchants (name)
        `)
        // Try to find the one from screenshot if possible, or just latest
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error fetching coupon:', error);
        return;
    }

    console.log('Coupon Code:', coupon.code);
    console.log('User ID:', coupon.user_id);
    console.log('User Data:', coupon.users);

    if (!coupon.users) {
        console.error('User join failed or user missing');
        return;
    }

    if (coupon.users.email === undefined) {
        console.error('❌ "email" field is MISSING from the returned user object. The column might not execute in the SELECT or does not exist on the table schema?');
    } else {
        console.log(`✅ "email" field exists. Value: "${coupon.users.email}"`);
    }

    // Double check database schema by listing column names via SQL injection trick or just failing
    // Actually, let's try to update it to see if it works
    if (!coupon.users.email) {
        console.log('Attempting to patch email for this user...');
        const { error: updateError } = await supabase
            .from('users')
            .update({ email: 'test_patch@example.com' })
            .eq('id', coupon.user_id);

        if (updateError) {
            console.error('❌ Failed to update email column:', updateError);
        } else {
            console.log('✅ Successfully updated email column! The column exists.');
        }
    }
}

checkUserEmail();
