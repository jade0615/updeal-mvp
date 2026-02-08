
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

async function get() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.from('merchants').select('id, name, slug').eq('slug', 'test-reservation').single();
    if (error) {
        fs.writeFileSync('merchant_id.txt', 'ERROR: ' + error.message);
        return;
    }
    fs.writeFileSync('merchant_id.txt', data.id);
}

get();
