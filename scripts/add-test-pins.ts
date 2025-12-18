// Load environment variables
import { config } from 'dotenv'
import { resolve } from 'path'
config({ path: resolve(__dirname, '../.env.local') })

import { createAdminClient } from '../src/lib/supabase/admin'

const supabase = createAdminClient()

async function addTestPins() {
  console.log('🔐 Adding test PINs to merchants...\n')

  try {
    // Get all merchants
    const { data: merchants, error } = await supabase
      .from('merchants')
      .select('id, name, slug, redeem_pin')

    if (error) {
      console.error('❌ Error fetching merchants:', error)
      return
    }

    if (!merchants || merchants.length === 0) {
      console.log('⚠️  No merchants found')
      return
    }

    console.log(`Found ${merchants.length} merchants\n`)

    // Update each merchant with a test PIN (1234 for testing)
    const TEST_PIN = '1234'

    for (const merchant of merchants) {
      if (merchant.redeem_pin) {
        console.log(`⏭️  ${merchant.name} (${merchant.slug}) - PIN already set: ${merchant.redeem_pin}`)
        continue
      }

      const { error: updateError } = await supabase
        .from('merchants')
        .update({ redeem_pin: TEST_PIN })
        .eq('id', merchant.id)

      if (updateError) {
        console.error(`❌ Failed to update ${merchant.name}:`, updateError.message)
      } else {
        console.log(`✅ ${merchant.name} (${merchant.slug}) - PIN set to: ${TEST_PIN}`)
      }
    }

    console.log('\n🎉 Done!')
    console.log('\n📝 Note: All merchants now have PIN: 1234 (for testing purposes)')
    console.log('   In production, each merchant should have their own unique PIN.\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

addTestPins().catch(console.error)
