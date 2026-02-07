
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function listSlugs() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('name, slug, internal_id');
        if (error) {
            console.error('Error:', error);
            return;
        }
        console.log('--- ALL MERCHANTS ---');
        data?.forEach(m => {
            console.log(`[${m.internal_id || 'no-id'}] NAME: "${m.name}" | SLUG: "${m.slug}"`);
        });
        console.log('--- END ---');
    } catch (e) {
        console.error('Script Error:', e);
    }
}

listSlugs();
