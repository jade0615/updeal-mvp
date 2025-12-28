import { createClient } from '@supabase/supabase-js'

// Service Role Client - bypasses RLS
export const createAdminClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Missing Supabase Admin credentials')
    }
    // During build or dev, return a mock or just log (though real calls will fail)
    console.warn('Warning: Missing Supabase Admin credentials. This is expected during static build steps.')
  }

  return createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}
