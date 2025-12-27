import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual env parsing to avoid reliance on dotenv quirks/paths
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};

envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1]] = match[2];
    }
});

const url = env['NEXT_PUBLIC_SUPABASE_URL'];
const key = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!url || !key) {
    console.error('Missing credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log('Checking for table: customer_claims...');
    // Try to insert a dummy record that will fail constraint or schema check
    // Actually, just selecting with limit 0 is safer and standard
    const { error } = await supabase.from('customer_claims').select('*').limit(0);

    if (error) {
        console.error('Error (Table likely missing):', error.message);
    } else {
        console.log('SUCCESS: Table "customer_claims" exists.');
    }
}

check();
