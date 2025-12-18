import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

async function createAdmin() {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

  const email = 'admin@updeal.com'
  const password = 'admin123' // 默认密码，首次登录后应该修改
  const name = 'Admin User'

  console.log('🔐 Creating admin user...')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .single()

  if (existing) {
    console.log('⚠️  Admin user already exists!')
    return
  }

  // Create admin user
  const { error } = await supabase.from('admin_users').insert({
    email,
    password_hash: passwordHash,
    name,
    role: 'admin',
    is_active: true
  })

  if (error) {
    console.error('❌ Failed to create admin:', error)
    process.exit(1)
  }

  console.log('✅ Admin user created successfully!')
  console.log('\n📝 Login credentials:')
  console.log(`   Email: ${email}`)
  console.log(`   Password: ${password}`)
  console.log('\n⚠️  Please change the password after first login!')
}

createAdmin()
