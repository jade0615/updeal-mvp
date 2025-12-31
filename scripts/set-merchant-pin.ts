
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createAdminClient } from '@/lib/supabase/admin';

async function main() {
    const args = process.argv.slice(2);
    const identifier = args[0];
    const pin = args[1];

    if (!identifier || !pin) {
        console.error('Usage: npx tsx scripts/set-merchant-pin.ts <slug_or_email> <pin>');
        process.exit(1);
    }

    console.log(`Setting PIN for merchant: ${identifier} -> ${pin}`);

    const supabase = createAdminClient();

    // 1. Check if merchant exists (Lookup by Slug, ID, or Email)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    let query = supabase.from('merchants').select('id, name, slug, redeem_pin');

    if (isUuid) {
        query = query.eq('id', identifier);
    } else if (identifier.includes('@')) {
        query = query.eq('email', identifier);
    } else {
        query = query.eq('slug', identifier);
    }

    const { data: merchant, error: fetchError } = await query.single();

    if (fetchError || !merchant) {
        console.error('Merchant not found by Email, Slug, or ID:', fetchError);
        process.exit(1);
    }

    console.log(`Found merchant: ${merchant.name} (${merchant.slug})`);
    console.log(`Current PIN: ${merchant.redeem_pin || 'None'}`);

    // 2. Update PIN
    const { error: updateError } = await supabase
        .from('merchants')
        .update({ redeem_pin: pin })
        .eq('id', merchant.id);

    if (updateError) {
        console.error('Error updating PIN:', updateError);
        process.exit(1);
    }

    console.log(`✅ PIN updated successfully to: ${pin}`);
}

main().catch(console.error);
