import { createAdminClient } from './src/lib/supabase/admin';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function listMerchants() {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from('merchants').select('slug, name').limit(5);
    if (error) {
        console.error('Error fetching merchants:', error);
        return;
    }
    console.log('Available Merchants:');
    data.forEach(m => console.log(`- Name: ${m.name}, Slug: ${m.slug}`));
}

listMerchants();
