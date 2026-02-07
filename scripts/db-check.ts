
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function checkMerchants() {
    try {
        const supabase = createSupabaseAdmin();
        const { data: testCoupon } = await supabase.from('merchants').select('slug').eq('slug', 'test-coupon').single();
        const { data: seafood } = await supabase.from('merchants').select('slug').eq('slug', 'live-crawfish-seafood').single();

        console.log('test-coupon exists:', !!testCoupon);
        console.log('live-crawfish-seafood exists:', !!seafood);

        if (!seafood) {
            console.log('Live Crawfish & Seafood NOT FOUND in current database.');
            const { data: all } = await supabase.from('merchants').select('name, slug');
            console.log('Current Merchants in DB:', all?.map(m => m.slug).join(', '));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

checkMerchants();
