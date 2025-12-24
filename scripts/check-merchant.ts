// Load environment variables from .env.local
import { config } from 'dotenv'
import { resolve } from 'path'

const envPath = resolve(process.cwd(), '.env.local')
config({ path: envPath })

// Dynamic import
async function check() {
    const { createAdminClient } = await import('../src/lib/supabase/admin')
    const supabase = createAdminClient()

    console.log('Checking for king-super-buffet-wpb...')
    const { data, error } = await supabase
        .from('merchants')
        .select('*')
        .eq('slug', 'king-super-buffet-wpb')
        .single()

    if (error) {
        console.error('Error:', error.message)
    } else {
        console.log('Found merchant:', data.slug)
        console.log('ID:', data.id)
        console.log('Active:', data.is_active)
    }
}

check()
