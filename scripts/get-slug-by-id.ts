
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function getSlug() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('slug, name').eq('internal_id', '1784').single();
        if (error) {
            console.error('Error:', error);
            return;
        }
        if (data) {
            console.log(`RESULT_SLUG: ${data.slug}`);
            console.log(`RESULT_NAME: ${data.name}`);
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
}

getSlug();
