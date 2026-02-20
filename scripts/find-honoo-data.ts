import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function findData() {
    console.log('🔍 Searching for merchant "HONOO"...');
    const { data: merchants, error: merchantError } = await supabase
        .from('merchants')
        .select('id, name')
        .ilike('name', '%HONOO%');

    if (merchantError) {
        console.error('❌ Error fetching merchant:', merchantError);
        return;
    }

    if (!merchants || merchants.length === 0) {
        console.log('❌ No merchant found with "HONOO" in name.');
        return;
    }

    console.log('✅ Found merchants:', merchants);

    for (const merchant of merchants) {
        console.log(`\n📊 Checking claims for ${merchant.name} (${merchant.id})...`);
        const { data: claims, error: claimsError, count } = await supabase
            .from('customer_claims')
            .select('*', { count: 'exact' })
            .eq('merchant_id', merchant.id);

        if (claimsError) {
            console.error(`❌ Error fetching claims for ${merchant.name}:`, claimsError);
            continue;
        }

        console.log(`✅ Found ${count} claims.`);
        if (claims && claims.length > 0) {
            const hasEmail = claims.filter(c => c.email).length;
            console.log(`📧 ${hasEmail} claims have email addresses.`);
            console.log('Sample data:', claims.slice(0, 2).map(c => ({ name: c.name, email: c.email })));
        }
    }
}

findData();
