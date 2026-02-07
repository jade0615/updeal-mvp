
import 'dotenv/config';
import { createAdminClient } from '../src/lib/supabase/admin';

async function findMerchant() {
    const supabase = createAdminClient();
    const { data, error } = await supabase
        .from('merchants')
        .select('name, slug')
        .or('name.ilike.%1784%,slug.ilike.%1784%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('FOUND_MERCHANTS:', JSON.stringify(data));
    } else {
        console.log('NO_MERCHANTS_FOUND_FOR_1784');
    }
}

findMerchant();
