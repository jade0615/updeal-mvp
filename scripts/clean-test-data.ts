
import { config } from 'dotenv'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
config({ path: envPath })

async function cleanData() {
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log('🧹 Cleaning up test data...')

    // Delete the '555' test user and their coupons
    const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('phone', '555')

    if (users && users.length > 0) {
        for (const user of users) {
            // Delete coupons first (FK constraint)
            await supabase.from('coupons').delete().eq('user_id', user.id)
            // Delete user
            await supabase.from('users').delete().eq('id', user.id)
            console.log(`✅ Deleted test user ${user.id} (phone: 555)`)
        }
    } else {
        console.log('User 555 not found.')
    }
}

cleanData().catch(console.error)
