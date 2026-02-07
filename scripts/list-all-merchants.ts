
import 'dotenv/config';
import { createAdminClient } from '../src/lib/wallet/WalletService'; // WalletService has getCertificates but maybe I can import admin from lib
import { createAdminClient as createSupabaseAdmin } from '../src/lib/supabase/admin';

async function listAll() {
    try {
        const supabase = createSupabaseAdmin();
        const { data, error } = await supabase.from('merchants').select('id, name, slug');

        if (error) {
            console.error('Database Error:', error);
            return;
        }

        console.log('--- MERCHANT LIST ---');
        data?.forEach(m => {
            console.log(`- ${m.name} (slug: ${m.slug})`);
        });
        console.log('--- END LIST ---');
    } catch (e) {
        console.error('Script Error:', e);
    }
}

listAll();
