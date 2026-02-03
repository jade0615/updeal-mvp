
import 'dotenv/config';
import { createAdminClient } from '../src/lib/supabase/admin';

async function get() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('merchants').select('id, name, slug').eq('slug', 'test-reservation').single();
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('MERCHANT_ID_START[' + data.id + ']MERCHANT_ID_END');
}

get();
