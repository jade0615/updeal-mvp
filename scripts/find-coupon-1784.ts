
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function findCoupon() {
    try {
        const supabase = createSupabaseAdmin();
        const { data: merchant } = await supabase.from('merchants').select('id').eq('slug', '1784').single();
        if (!merchant) {
            console.log('MERCHANT_NOT_FOUND');
            return;
        }

        const { data: coupons, error } = await supabase.from('coupons').select('code').eq('merchant_id', merchant.id).limit(1);

        if (error) {
            console.error('Error:', error);
            return;
        }

        if (coupons && coupons.length > 0) {
            console.log('LATEST_COUPON_CODE:', coupons[0].code);
        } else {
            console.log('NO_COUPONS_FOUND_FOR_1784');
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
}

findCoupon();
