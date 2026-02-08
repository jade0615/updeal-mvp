
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function debug() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Testing connection...');
    const { data: test, error: testError } = await supabase.from('merchants').select('id').limit(1);
    if (testError) {
        console.error('Connection failed:', testError.message);
        return;
    }
    console.log('Connection OK');

    console.log('Trying to insert a test user...');
    const testPhone = '+11234567890';
    const { data, error } = await supabase
        .from('users')
        .insert({ phone: testPhone, name: 'Debug User' })
        .select()
        .single();

    if (error) {
        console.error('Insert failed:', error.message);
        console.error('Error Details:', JSON.stringify(error, null, 2));

        // Check schema
        console.log('Fetching table structure (simulated)...');
    } else {
        console.log('Insert success:', data.id);
        // Cleanup
        await supabase.from('users').delete().eq('id', data.id);
    }
}

debug();
