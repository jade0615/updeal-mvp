import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic';

// To protect this route, we use a CRON_SECRET from env
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function GET(request: NextRequest) {
    // 1. Auth check (Simple header-based secret)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    try {
        // 2. Define "Yesterday" time range
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const startOfYesterday = new Date(yesterday)
        startOfYesterday.setHours(0, 0, 0, 0)

        const endOfYesterday = new Date(yesterday)
        endOfYesterday.setHours(23, 59, 59, 999)

        // 3. Fetch Yesterday's Global Stats
        // 3a. Real Claims (Coupons Created)
        const { count: claimsCount, error: claimsError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', startOfYesterday.toISOString())
            .lte('created_at', endOfYesterday.toISOString())

        // 3b. Redemptions (Coupons Redeemed)
        const { count: redemptionsCount, error: redemptionsError } = await supabase
            .from('coupons')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'redeemed')
            .gte('redeemed_at', startOfYesterday.toISOString())
            .lte('redeemed_at', endOfYesterday.toISOString())

        if (claimsError || redemptionsError) {
            console.error('Data fetch error:', claimsError, redemptionsError)
            return NextResponse.json({ error: 'Failed to fetch yesterday statistics' }, { status: 500 })
        }

        // 4. Calculate Estimated Revenue ($)
        // Heuristic: Each claim is worth ~$15 for the merchant in lifetime value or visit value
        const estimatedRevenue = (claimsCount || 0) * 15;

        // 5. Construct HTML Email
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://updeal.xyz'
        const merchantDashboardLink = `${baseUrl}/admin/merchants` // Or a specific dashboard

        const htmlContent = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #10b981; font-size: 28px; margin-bottom: 5px;">🚀 [Updeal] 昨日战报</h1>
                    <p style="color: #666; margin-top: 0;">${startOfYesterday.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <div style="background: #f8fafc; border-radius: 12px; padding: 25px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
                    <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                        <div style="text-align: center;">
                            <p style="text-transform: uppercase; font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 8px;">昨日领取</p>
                            <span style="font-size: 32px; font-weight: bold; color: #0f172a;">${claimsCount || 0} <small style="font-size: 14px; font-weight: normal; color: #94a3b8;">人</small></span>
                        </div>
                        <div style="text-align: center; margin-top: 20px;">
                            <p style="text-transform: uppercase; font-size: 12px; font-weight: bold; color: #64748b; margin-bottom: 8px;">预计带来营收</p>
                            <span style="font-size: 32px; font-weight: bold; color: #10b981;">$${estimatedRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h2 style="font-size: 18px; font-weight: bold; margin-bottom: 15px;">详细核销数据</h2>
                    <ul style="padding-left: 20px;">
                        <li>昨日已核销: <strong>${redemptionsCount || 0}</strong> 人</li>
                        <li>核销率: <strong>${claimsCount && claimsCount > 0 ? ((redemptionsCount || 0) / claimsCount * 100).toFixed(1) : 0}%</strong></li>
                    </ul>
                </div>

                <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                    <a href="${merchantDashboardLink}" 
                       style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                        Magic Link: 点击查看实时商户看板
                    </a>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
                        此邮件由 Updeal 自动化汇报系统自动发送
                    </p>
                </div>
            </div>
        `;

        // 6. Send Email
        const emailTo = process.env.REPORT_RECIPIENT_EMAIL || 'owner@updeal.xyz';

        if (resend) {
            const { data, error: sendError } = await resend.emails.send({
                from: 'Updeal Reports <reports@updeal.xyz>',
                to: [emailTo],
                subject: `🚀 [Updeal] 昨日战报 - ${startOfYesterday.toLocaleDateString()}`,
                html: htmlContent,
            });

            if (sendError) {
                console.error('Email send failed:', sendError);
                return NextResponse.json({ error: 'Email send failed', details: sendError }, { status: 500 })
            }

            return NextResponse.json({
                success: true,
                message: 'Daily brief sent successfully',
                data: {
                    claims: claimsCount,
                    revenue: estimatedRevenue,
                    sentTo: emailTo,
                    resendId: data?.id
                }
            })
        } else {
            // Log the report if Resend is not configured
            console.log('--- MOCK EMAIL REPORT ---');
            console.log('To:', emailTo);
            console.log('Subject: 🚀 [Updeal] 昨日战报');
            console.log('Content:', htmlContent);
            console.log('--- END MOCK ---');

            return NextResponse.json({
                success: true,
                message: 'Daily brief generated (MOCKED)',
                data: {
                    claims: claimsCount,
                    revenue: estimatedRevenue,
                    sentTo: emailTo,
                    warning: 'RESEND_API_KEY not configured'
                }
            })
        }

    } catch (error: any) {
        console.error('Cron Error:', error)
        return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
    }
}
