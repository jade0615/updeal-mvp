
import { config } from 'dotenv'
import { resolve } from 'path'
import twilio from 'twilio'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'

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
const CSV_PATH = '../../会员管理-202512221125342220.csv' // Relative to scripts dir (up two levels)

// TEST MODE: Set to false to send to everyone. Set to true to send only to ADMIN.
const TEST_MODE = false
const ADMIN_PHONE = '+13239529493'

async function sendCampaign() {
    console.log(`🚀 Starting SMS Campaign for: ${CAMPAIGN_SLUG}`)
    console.log(`   Mode: ${TEST_MODE ? 'TEST (Admin Only)' : 'LIVE (All Targets)'}\n`)

    let targets: { phone: string, name: string }[] = []

    if (TEST_MODE) {
        targets = [{ phone: ADMIN_PHONE, name: 'Admin' }]
    } else {
        // Read targets from CSV
        try {
            const fileContent = readFileSync(resolve(__dirname, CSV_PATH), 'utf-8')
            const records = parse(fileContent, {
                columns: true,
                skip_empty_lines: true,
                relax_column_count: true
            })

            console.log(`📄 Loaded ${records.length} records from CSV.`)

            records.forEach((row: any) => {
                const rawPhone = row['手机号码']
                const name = row['昵称'] || 'Customer'

                if (!rawPhone) return

                const digits = rawPhone.replace(/\D/g, '')
                let cleanPhone = null

                if (digits.length === 10) {
                    cleanPhone = `+1${digits}`
                } else if (digits.length === 11 && digits.startsWith('1')) {
                    cleanPhone = `+${digits}`
                }

                if (cleanPhone) {
                    targets.push({ phone: cleanPhone, name })
                }
            })

            console.log(`✅ Identified ${targets.length} valid targets.`)

        } catch (error) {
            console.error('Error reading CSV:', error)
            return
        }
    }

    if (targets.length === 0) {
        console.error('No valid targets found.')
        return
    }

    let successCount = 0
    let failCount = 0

    console.log(`   Preparing to send to ${targets.length} recipients...\n`)

    for (const target of targets) {
        // Generate the auto-login link
        const personalLink = `${BASE_URL}/${CAMPAIGN_SLUG}?phone=${encodeURIComponent(target.phone)}`

        // The SMS Body - MEGA MERGED VERSION
        const messageBody = `🎄 ARCADIA is OPEN on Christmas! 🎄
🎉 Grand Opening Specials are HERE! 🎉

Bring the family and have fun today 🎮✨

🎁 5 FREE Tokens + VIP Spin (No Activation Fee)
🎁 20% Bonus on every Top-Up
🎁 Buy One Get One 50% OFF
🎁 FREE Play Area with first purchase!

🕹️ Enjoy limited-time Play Passes — choose from 30-Min, 40-Min (Most Popular), or 60-Min Unlimited Play!

🎁 Share this event & get a small in-store gift
🍀 Bonus: Labubu collectible or On-site Lucky Draw (leave a review)

📍 2885D N Military Trail, West Palm Beach
👉 Walk in today and start the fun!

Tap to redeem: ${personalLink}`

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
        if (!TEST_MODE) {
            await new Promise(r => setTimeout(r, 200)) // 5 messages per second approx
        }
    }

    console.log('\n🏁 Campaign finished.')
    console.log(`   Success: ${successCount}`)
    console.log(`   Failed:  ${failCount}`)
}

sendCampaign().catch(console.error)
