
import { config } from 'dotenv'
import { resolve } from 'path'
import twilio from 'twilio'

// Load env vars from .env.local parent directory
config({ path: resolve(__dirname, '../.env.local') })

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const fromNumber = process.env.TWILIO_FROM_NUMBER

if (!accountSid || !authToken || !fromNumber) {
    console.error('❌ Missing Twilio credentials in .env.local')
    console.error('Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER')
    process.exit(1)
}

const client = twilio(accountSid, authToken)

// --- CONFIGURATION ---
const BASE_URL = 'https://updeal.top' // Production domain
const CAMPAIGN_SLUG = 'arcadia-special'

// List of customers to target
// Format: E.164 phone numbers (e.g., +15551234567)
const targets = [
    { name: 'Admin', phone: '+13239529493' },
]

async function sendCampaign() {
    console.log(`🚀 Starting SMS Campaign for: ${CAMPAIGN_SLUG}`)
    console.log(`   Targets: ${targets.length} recipients\n`)

    let successCount = 0
    let failCount = 0

    for (const target of targets) {
        // Generate the auto-login link
        const personalLink = `${BASE_URL}/${CAMPAIGN_SLUG}?phone=${encodeURIComponent(target.phone)}`

        // The SMS Body
        const messageBody = `🎉 ARCADIA Grand Opening Specials are HERE! 🎉\n\nLooking for fun the whole family will love? 🎮✨\nEnjoy limited-time Play Passes — choose from 30-Min, 40-Min (Most Popular), or 60-Min Unlimited Play!\n\n🎁 Share this event & get a small in-store gift\n🍀 Bonus: Labubu collectible or On-site Lucky Draw (leave a review)\n\n📍 2885D N Military Trail, West Palm Beach\n🕚 Open Daily: 11:00 AM – 9:00 PM\n👉 Walk in today and start the fun!\n\nTap to redeem: ${personalLink}`

        try {
            console.log(`   Sending to ${target.phone}...`)
            const result = await client.messages.create({
                body: messageBody,
                from: fromNumber,
                to: target.phone
            })
            console.log(`   ✅ Sent! SID: ${result.sid}`)
            successCount++
        } catch (error: any) {
            console.error(`   ❌ Failed to send to ${target.phone}:`, error.message)
            failCount++
        }

        // Small pause to be nice to the rate limiter (optional)
        await new Promise(r => setTimeout(r, 500))
    }

    console.log('\n🏁 Campaign finished.')
    console.log(`   Success: ${successCount}`)
    console.log(`   Failed:  ${failCount}`)
}

sendCampaign().catch(console.error)
