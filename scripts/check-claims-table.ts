import dotenv from 'dotenv';
import path from 'path';

// Load env vars FIRST
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Then import the admin client
import { createAdminClient } from '../src/lib/supabase/admin';

async function checkTable() {
    const supabase = createAdminClient();
    const { error } = await supabase.from('customer_claims').select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Table check failed:', error.message);
        if (error.code === '42P01') {
            console.log('The table "customer_claims" likely does NOT exist.');
        }
    } else {
        console.log('Table "customer_claims" exists and is accessible.');
    }
}

checkTable();
