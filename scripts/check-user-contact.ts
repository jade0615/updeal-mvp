
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserContactInfo(limit = 10) {
    console.log(`Checking contact info for last ${limit} users...`);

    // We need to join coupons with users properly
    const { data: coupons, error } = await supabase
        .from('coupons')
        .select(`
      id,
      code,
      created_at,
      email_sent_stage,
      user_id,
      users!inner (
        id,
        phone,
        email,
        name
      )
    `)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching data:', error);
        return;
    }

    console.log('Recent Claims Data:');
    console.log('------------------------------------------------------------------------------------------------');
    console.log('| Code        | Phone          | Email                          | Name             | Sent? | Time                |');
    console.log('------------------------------------------------------------------------------------------------');

    coupons.forEach((c: any) => {
        const email = c.users?.email || 'MISSING';
        const phone = c.users?.phone || 'MISSING';
        const name = c.users?.name || '-';
        const sent = c.email_sent_stage === 1 ? 'YES' : 'NO';
        const time = new Date(c.created_at).toLocaleString();

        console.log(`| ${c.code.padEnd(11)} | ${phone.padEnd(14)} | ${email.padEnd(30)} | ${name.padEnd(16)} | ${sent.padEnd(5)} | ${time} |`);
    });
    console.log('------------------------------------------------------------------------------------------------');
}

checkUserContactInfo();
