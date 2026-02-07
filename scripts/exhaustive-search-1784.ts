
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function exhaustiveSearch() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('*');

        if (error) {
            console.error('Error:', error);
            return;
        }

        console.log('Searching for 1784...');
        const matches = data?.filter(m => {
            const str = JSON.stringify(m);
            return str.includes('1784');
        });

        if (matches && matches.length > 0) {
            console.log('MATCH_FOUND:', JSON.stringify(matches.map(m => ({ name: m.name, slug: m.slug, id: m.id }))));
        } else {
            console.log('NO_MATCH_FOUND_IN_MERCHANTS');
        }
    } catch (e) {
        console.error('Script Error:', e);
    }
}

exhaustiveSearch();
