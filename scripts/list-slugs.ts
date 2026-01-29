import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl!, supabaseKey!)

async function listSlugs() {
    const { data, error } = await supabase.from('merchants').select('slug')
    if (error) {
        console.error(error)
        return
    }
    console.log('Slugs:', data?.map(m => m.slug))
}

listSlugs()
