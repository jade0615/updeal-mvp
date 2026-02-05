
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

async function updateMerchant() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const merchantId = '127a429d-6122-46e0-9d44-70bf09f6d3a0';

    console.log('Updating merchant:', merchantId);

    const { data, error } = await supabase
        .from('merchants')
        .update({
            name: '上海办公室折扣',
            latitude: 31.0748,
            longitude: 121.5080,
            content: {
                businessName: "上海办公室折扣",
                logoText: "上海办公室折扣",
                address: {
                    fullAddress: "上海市闵行区浦江镇浦新公路1601号A栋"
                },
                offer: {
                    value: "上海办测试优惠",
                    description: "Shanghai Office Geofencing Test"
                }
            }
        })
        .eq('id', merchantId)
        .select();

    if (error) {
        console.error('Update failed:', error.message);
    } else {
        console.log('Update success! Merchant updated with Shanghai coordinates.');
        console.log(JSON.stringify(data, null, 2));
    }
}

updateMerchant();
