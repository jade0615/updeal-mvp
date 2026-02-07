
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function findMatch() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('name, slug');
        if (error) {
            console.error('Error:', error);
            return;
        }
        data?.forEach(m => {
            const str = JSON.stringify(m);
            if (str.includes('1784')) {
                console.log('SLUG_ONLY:' + m.slug);
                console.log('NAME_ONLY:' + m.name);
            }
        });
    } catch (e) {
        console.error('Script Error:', e);
    }
}

findMatch();
