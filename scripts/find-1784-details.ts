
import 'dotenv/config';
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function findMatch() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('*');
        if (error) {
            console.error('Error:', error);
            return;
        }
        data?.forEach(m => {
            const str = JSON.stringify(m);
            if (str.includes('1784')) {
                console.log('--- MATCH START ---');
                console.log('ID:', m.id);
                console.log('NAME:', m.name);
                console.log('SLUG:', m.slug);
                console.log('--- MATCH END ---');
            }
        });
    } catch (e) {
        console.error('Script Error:', e);
    }
}

findMatch();
