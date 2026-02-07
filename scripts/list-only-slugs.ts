
import 'dotenv/config';
import { createAdminClient } from '../src/lib/supabase/admin';

async function listSlugs() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase.from('merchants').select('slug').order('slug');
        if (error) {
            console.error('Error:', error);
            return;
        }
        console.log('--- START SLUGS ---');
        data?.forEach(m => {
            if (m.slug) console.log(m.slug);
        });
        console.log('--- END SLUGS ---');
    } catch (e) {
        console.error('Script Error:', e);
    }
}

listSlugs();
