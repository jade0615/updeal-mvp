import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function runMigration() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not defined in .env.local')
    process.exit(1)
  }

  console.log('🔌 Connecting to database...')
  const pool = new Pool({ connectionString: databaseUrl })

  try {
    const client = await pool.connect()
    console.log('✅ Connected.')

    // Read migration file
    const migrationPath = path.join(
      __dirname,
      '../supabase/migrations/add_coupon_fields.sql'
    )
    console.log(`📄 Reading migration from ${migrationPath}...`)
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')

    // Execute migration
    console.log('🚀 Executing migration...')
    await client.query(migrationSQL)

    console.log('✅ Migration completed successfully!')

    client.release()
    await pool.end()
  } catch (error) {
    console.error('❌ Migration failed:', error)
    await pool.end()
    process.exit(1)
  }
}

runMigration()
