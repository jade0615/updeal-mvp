// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import pg from 'pg'
import { readFileSync } from 'fs'

const { Client } = pg

async function runMigration() {
  console.log('🔌 Connecting to database...')

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  })

  try {
    await client.connect()
    console.log('✅ Connected.\n')

    // Read migration file
    const sqlPath = resolve(__dirname, '../supabase/migrations/001_add_security_fields.sql')
    console.log(`📄 Reading migration from ${sqlPath}...`)
    const sql = readFileSync(sqlPath, 'utf-8')

    console.log('🚀 Executing migration...\n')

    // Execute the migration
    await client.query(sql)

    console.log('✅ Migration completed successfully!\n')
    console.log('📋 Changes applied:')
    console.log('  ✓ Added phone_e164 column to coupons')
    console.log('  ✓ Added phone_last4 column to coupons')
    console.log('  ✓ Added redeem_pin column to merchants')
    console.log('  ✓ Created unique constraint on (merchant_id, phone_e164)')
    console.log('  ✓ Added indexes for performance')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await client.end()
  }
}

runMigration().catch(console.error)
