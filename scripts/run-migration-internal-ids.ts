/**
 * Run database migration to add internal_id fields
 * Usage: npx tsx scripts/run-migration-internal-ids.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running migration: add_internal_ids...\n');

  try {
    // Add internal_id to merchants table
    console.log('1. Adding internal_id to merchants table...');
    const { error: merchantError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE merchants ADD COLUMN IF NOT EXISTS internal_id TEXT;'
    }).single();

    if (merchantError) {
      // Try direct SQL if rpc doesn't work
      const { error } = await supabase.from('merchants').select('internal_id').limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log('   ⚠️ Column does not exist, need to add via Supabase Dashboard');
      } else if (!error) {
        console.log('   ✅ merchants.internal_id already exists');
      }
    } else {
      console.log('   ✅ merchants.internal_id added');
    }

    // Add internal_id to users table
    console.log('2. Adding internal_id to users table...');
    const { error: userError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS internal_id TEXT;'
    }).single();

    if (userError) {
      // Try direct SQL if rpc doesn't work
      const { error } = await supabase.from('users').select('internal_id').limit(1);
      if (error && error.message.includes('does not exist')) {
        console.log('   ⚠️ Column does not exist, need to add via Supabase Dashboard');
      } else if (!error) {
        console.log('   ✅ users.internal_id already exists');
      }
    } else {
      console.log('   ✅ users.internal_id added');
    }

    // Test if columns exist by querying them
    console.log('\n3. Verifying columns exist...');

    const { data: merchantTest, error: mTestErr } = await supabase
      .from('merchants')
      .select('id, internal_id')
      .limit(1);

    if (mTestErr) {
      console.log(`   ❌ merchants.internal_id: ${mTestErr.message}`);
    } else {
      console.log('   ✅ merchants.internal_id exists');
    }

    const { data: userTest, error: uTestErr } = await supabase
      .from('users')
      .select('id, internal_id')
      .limit(1);

    if (uTestErr) {
      console.log(`   ❌ users.internal_id: ${uTestErr.message}`);
    } else {
      console.log('   ✅ users.internal_id exists');
    }

    console.log('\n✅ Migration check complete!');

    if (mTestErr || uTestErr) {
      console.log('\n📋 If columns are missing, run this SQL in Supabase Dashboard:');
      console.log('─'.repeat(50));
      console.log('ALTER TABLE merchants ADD COLUMN IF NOT EXISTS internal_id TEXT;');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS internal_id TEXT;');
      console.log('─'.repeat(50));
    }

  } catch (err) {
    console.error('❌ Migration error:', err);
  }
}

runMigration();
