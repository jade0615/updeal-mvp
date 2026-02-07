
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function findMatch() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('id, name, slug');
        if (error) {
            console.error('Error:', error);
            return;
        }
        data?.forEach(m => {
            if (m.name.includes('1784') || m.slug.includes('1784')) {
                console.log(`FOUND_SLUG: ${m.slug} | NAME: ${m.name}`);
            }
        });
    } catch (e) {
        console.error('Script Error:', e);
    }
}

findMatch();
