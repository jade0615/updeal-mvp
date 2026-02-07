
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function findField() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('*');
        if (error) {
            console.error('Error:', error);
            return;
        }
        data?.forEach(m => {
            for (const [key, value] of Object.entries(m)) {
                if (JSON.stringify(value).includes('1784')) {
                    console.log(`FOUND_IN_FIELD: ${key} | SLUG: ${m.slug}`);
                }
            }
        });
    } catch (e) {
        console.error('Script Error:', e);
    }
}

findField();
