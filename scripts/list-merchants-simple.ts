
import 'dotenv/config';
import { createAdminClient } from '../src/lib/supabase/admin';

async function list() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('merchants').select('id, name, slug').limit(1);
    if (error) {
        console.error('Error:', error);
        return;
    }
    if (data && data.length > 0) {
        console.log('VALID_ID:' + data[0].id);
    } else {
        console.log('NO_MERCHANTS_FOUND');
    }
}

list();
