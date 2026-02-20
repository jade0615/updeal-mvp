const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listAll() {
    const { data, error } = await supabase.from('merchants').select('id, name, slug');
    if (error) {
        fs.writeFileSync('merchants_list.txt', 'ERROR: ' + JSON.stringify(error));
    } else {
        fs.writeFileSync('merchants_list.txt', JSON.stringify(data, null, 2));
    }
}

listAll();
