
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function listAll() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('name, slug');
        if (error) {
            console.error('Error:', error);
            return;
        }
        console.log('MERCHANTS:', JSON.stringify(data));
    } catch (e) {
        console.error('Script Error:', e);
    }
}

listAll();
