
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function getSlug() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('slug').eq('internal_id', '1784').single();
        if (error) {
            console.error('Error:', error);
            return;
        }
        if (data) {
            process.stdout.write('FULL_SLUG:' + data.slug + '\n');
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
}

getSlug();
