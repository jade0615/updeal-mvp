import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
    const { count, error } = await supabase.from('merchants').select('*', { count: 'exact', head: true })
    if (error) {
        console.error('Supabase connection error:', error.message)
        process.exit(1)
    }
    console.log('Supabase connection successful. Merchant count:', count)
}

testConnection()
