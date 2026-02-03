
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function updateMerchantCoords() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const merchantId = '127a429d-6122-46e0-9d44-70bf09f6d3a0';
    const newLat = 31.088380;
    const newLng = 121.503500;

    console.log(`Updating merchant ${merchantId} to WGS-84 coordinates: ${newLat}, ${newLng}`);

    const { data, error } = await supabase
        .from('merchants')
        .update({
            latitude: newLat,
            longitude: newLng
        })
        .eq('id', merchantId)
        .select('id, name, latitude, longitude');

    if (error) {
        console.error('❌ Update failed:', error.message);
    } else {
        console.log('✅ Update success! Merchant updated with WGS-84 coordinates.');
        console.log(JSON.stringify(data, null, 2));
    }
}

updateMerchantCoords();
