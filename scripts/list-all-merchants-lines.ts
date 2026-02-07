
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
        data?.forEach(m => {
            console.log(`MERCHANT_ITEM: ${m.name} | SLUG: ${m.slug}`);
        });
    } catch (e) {
        console.error('Script Error:', e);
    }
}

listAll();
