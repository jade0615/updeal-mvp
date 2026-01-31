
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Force load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// 1. Setup Environment
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing Supabase Env Vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const merchantId = 'e2fb7062-811c-4b68-80f3-85f02c610996'; // Test Merchant (Ramen Bar) probably, or pick one found.

async function runFullTest() {
    console.log('🚀 Starting Full E2E Email Test...');

    // 2. Identify Target Merchant
    const { data: merchant } = await supabase
        .from('merchants')
        .select('id, name, slug')
        .eq('slug', 'honoo-ramen-bar') // Using a known slug
        .single();

    if (!merchant) {
        console.error('❌ Merchant Not Found. Using fallback.');
        return;
    }
    console.log(`✅ Targeted Merchant: ${merchant.name} (${merchant.id})`);

    // 3. Define Test User
    const testPhone = '15550009999'; // Dedicated Test Phone to avoid conflict
    const testEmail = 'wisdomjadefeng@gmail.com';
    console.log(`👤 Test User: ${testEmail} / ${testPhone}`);

    // 4. CLEANUP: Delete previous coupon for this user/merchant combo to force "New Claim" logic
    // First find user ID
    const { data: user } = await supabase.from('users').select('id').eq('phone', testPhone).single();

    if (user) {
        console.log(`🧹 Cleaning up previous coupons for user ${user.id}...`);
        await supabase.from('coupons').delete().eq('user_id', user.id).eq('merchant_id', merchant.id);
    }

    // 5. Simulate API Payload used in Front-end
    const payload = {
        merchantId: merchant.id,
        phone: testPhone,
        name: 'AutoTester',
        email: testEmail,
        expectedVisitDate: new Date().toISOString(), // NOW
        expectedVisitTime: '18:00'
    };

    // 6. Invoke Logic (Simulating route.ts logic here directly to test integration)
    // We can't call internal API from script easily via HTTP without running server, 
    // so we will Re-Run the `sendT0Confirmation` directly using the exact same path.

    console.log('🔄 Calling Email Service...');

    // Dynamic import to use the REAL email.ts file
    const { sendT0Confirmation } = await import('../src/lib/email');

    const { data: merchantDetails } = await supabase
        .from('merchants')
        .select('*')
        .eq('id', merchant.id)
        .single();

    // Generate a mock code
    const code = 'TEST-AUTO-999';

    const result = await sendT0Confirmation({
        email: testEmail,
        merchantName: merchant.name,
        couponCode: code,
        expectedDate: new Date(),
        address: merchantDetails.content?.address?.fullAddress || '123 Test St',
        merchantSlug: merchant.slug,
        referralCode: 'REF-TEST',
        offerValue: '50% OFF',
        offerDescription: 'Test Offer Description'
    });

    if (result.success) {
        console.log('✅✅✅ EMAIL SENT SUCCESSFULLY (according to Nodemailer) ✅✅✅');
        console.log('Please check inbox for: "You\'re in! 🎟️ Save your visit to Honoo Ramen Bar inside"');
    } else {
        console.error('❌❌❌ FAILED TO SEND EMAIL:', result.error);
    }

}

runFullTest();
