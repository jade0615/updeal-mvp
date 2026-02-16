
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://vlnhnvanfzbgfnxqksln.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZsbmhudmFuZnpiZ2ZueHFrc2xuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc4MjEyMCwiZXhwIjoyMDgxMzU4MTIwfQ.Apa14ZwHp_uRrss5y_v2WvEuglVvpP_bW35b0sXVAYc'

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectCoupons() {
    const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('status', 'redeemed')
        .limit(3)

    if (error) {
        console.error('Error:', error)
    } else if (data && data.length > 0) {
        console.log('Columns:', Object.keys(data[0]))
        console.log('Sample Data:', JSON.stringify(data[0], null, 2))
    } else {
        console.log('No redeemed coupons found.')
    }
}

inspectCoupons()
