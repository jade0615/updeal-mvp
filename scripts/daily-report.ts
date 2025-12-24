const dotenv = require('dotenv')
const path = require('path')

// Load env vars IMMEDIATELY
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

async function generateDailyReport() {
    const { createAdminClient } = require('../src/lib/supabase/admin')
    console.log('🚀 Starting Daily Report Generation...')
    const supabase = createAdminClient()

    // 1. Get all active merchants
    const { data: merchants, error: merchantsError } = await supabase
        .from('merchants')
        .select('id, name, slug')
        .eq('is_active', true)

    if (merchantsError || !merchants) {
        console.error('Error fetching merchants:', merchantsError)
        return
    }

    // 2. Calculate time range (Yesterday)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (const merchant of merchants) {
        console.log(`Processing: ${merchant.name}...`)

        // Get Claims yesterday
        const { count: claimsCount } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)
            .gte('created_at', yesterday.toISOString())
            .lt('created_at', today.toISOString())

        // Get Redemptions yesterday
        const { count: redeemedCount } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('merchant_id', merchant.id)
            .eq('status', 'redeemed')
            .gte('redeemed_at', yesterday.toISOString())
            .lt('redeemed_at', today.toISOString())

        // Estimated revenue logic (e.g. $40 per redemption)
        const estRevenue = (redeemedCount || 0) * 40

        const reportHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                <h1 style="color: #2563eb; text-align: center;">🚀 [Updeal] 昨日战报</h1>
                <p style="text-align: center; color: #666;">${yesterday.toLocaleDateString()}</p>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h2 style="margin-top: 0; font-size: 18px;">${merchant.name}</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 8px 0; color: #666;">真实领取人数</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${claimsCount || 0} 人</td>
                        </tr>
                        <tr>
                            <td style="padding: 8px 0; color: #666;">核销人数</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #059669;">${redeemedCount || 0} 人</td>
                        </tr>
                        <tr style="border-top: 1px solid #e2e8f0;">
                            <td style="padding: 15px 0 8px; color: #666;">预计带来营收</td>
                            <td style="padding: 15px 0 8px; text-align: right; font-weight: bold; font-size: 20px; color: #2563eb;">$${estRevenue}</td>
                        </tr>
                    </table>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://updeal.top/store-redeem/${merchant.slug}" 
                       style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                       点击查看实时商户看板
                    </a>
                </div>
                
                <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 40px;">
                    Updeal - 助力商户业绩增长的营销引擎
                </p>
            </div>
        `

        console.log(`Report for ${merchant.name}:`)
        console.log('--- HTML CONTENT START ---')
        console.log(reportHtml)
        console.log('--- HTML CONTENT END ---')

        // TODO: Integration with Resend/Nodemailer
        // await sendEmail(merchant.email, `🚀 [Updeal] 昨日战报 - ${merchant.name}`, reportHtml)
    }

    console.log('✅ Daily Report processing complete.')
}

generateDailyReport().catch(console.error)
