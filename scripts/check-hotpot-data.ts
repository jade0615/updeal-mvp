
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
    const slug = 'hot-pot-757-colonial-heights';
    const { data: m, error } = await supabase
        .from('merchants')
        .select('id, name, content')
        .eq('slug', slug)
        .single();

    if (error || !m) {
        console.error('Merchant not found:', error);
        return;
    }
    console.log('Merchant:', JSON.stringify(m, null, 2));

    const { count, error: cError } = await supabase
        .from('coupons')
        .select('*', { count: 'exact', head: true })
        .eq('merchant_id', m.id)
        .neq('status', 'redeemed');

    if (cError) {
        console.error('Coupons error:', cError);
    } else {
        console.log('Unredeemed coupons count:', count);
    }
}

main();
