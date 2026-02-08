
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function debug() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing Supabase environment variables');
        return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('--- Debugging Supabase User Registration ---');
    const testPhone = '+1' + Math.floor(Math.random() * 9000000000 + 1000000000).toString();
    console.log('Attempting to insert test user with phone:', testPhone);

    const { data, error } = await supabase
        .from('users')
        .insert({
            phone: testPhone,
            name: 'Debug User',
            email: 'debug@example.com'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Insert failed!');
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
    } else {
        console.log('✅ Insert success! User ID:', data.id);
        // Cleanup
        await supabase.from('users').delete().eq('id', data.id);
        console.log('Successfully cleaned up test user.');
    }
}

debug();
