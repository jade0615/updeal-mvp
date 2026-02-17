'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMerchantSession } from '@/lib/merchant-auth'
import { resend } from '@/lib/email/resend'
import { getExpirationReminderEmailTemplate } from '@/lib/email/templates'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth/session'

export interface RemindersResult {
    success: boolean
    message?: string
    recipientCount?: number
    successCount?: number
    failCount?: number
    error?: string
}

/**
 * Server action to send coupon expiration reminders for a specific merchant
 */
export async function sendExpirationRemindersAction(explicitMerchantId?: string): Promise<RemindersResult> {
    try {
        let targetMerchantId: string;
        let adminSession: any = null;

        const supabase = createAdminClient();

        // 1. Authorization check
        if (explicitMerchantId) {
            // If merchantId is provided, requester MUST be an admin
            const cookieStore = await cookies();
            const token = cookieStore.get('updeal_admin_session')?.value;
            if (!token) {
                return { success: false, error: '未授权：需要管理员权限' };
            }
            adminSession = await validateSession(token);
            if (!adminSession) {
                return { success: false, error: '未授权：管理员会话无效' };
            }
            targetMerchantId = explicitMerchantId;
        } else {
            // Default: use current merchant session
            const session = await getMerchantSession();
            if (!session || !session.merchants) {
                return { success: false, error: '未登录，请先登录商家账号' };
            }
            targetMerchantId = session.merchants.id;
        }

        // 2. Check cooldown (24 hours) - only if NOT admin (Admins can override or we still want the log?)
        // The user said: "同一商户 24 小时内只能群发一次"，so let's keep it for everyone for now.
        const { data: mData, error: mError } = await supabase
            .from('merchants')
            .select('last_reminder_sent_at, name, slug, address, phone')
            .eq('id', targetMerchantId)
            .single()

        if (mError || !mData) {
            return { success: false, error: '获取商家信息失败' }
        }

        if (mData.last_reminder_sent_at) {
            const lastSent = new Date(mData.last_reminder_sent_at).getTime()
            const now = new Date().getTime()
            const hoursSince = (now - lastSent) / (1000 * 60 * 60)

            if (hoursSince < 24) {
                const remaining = Math.ceil(24 - hoursSince)
                return {
                    success: false,
                    error: `发送频率限制：该商户每 24 小时只能群发一次。请在 ${remaining} 小时后再试。`
                }
            }
        }

        // 3. Fetch unredeemed coupons and users
        const { data: coupons, error: cError } = await supabase
            .from('coupons')
            .select('user_id')
            .eq('merchant_id', targetMerchantId)
            .neq('status', 'redeemed')

        if (cError) {
            return { success: false, error: '获取优惠券数据失败' }
        }

        const userIds = Array.from(new Set(coupons.map(c => c.user_id).filter(Boolean))) as string[]
        if (userIds.length === 0) {
            return { success: true, message: '没有发现待核销的优惠券，无需发送提醒。', recipientCount: 0 }
        }

        const { data: users, error: uError } = await supabase
            .from('users')
            .select('email, name')
            .in('id', userIds)
            .not('email', 'is', null)

        if (uError) {
            return { success: false, error: '获取客户数据失败' }
        }

        if (!users || users.length === 0) {
            return { success: true, message: '没有找到有有效邮箱的客户。', recipientCount: 0 }
        }

        // 4. Send emails via Resend
        if (!resend) {
            return { success: false, error: '邮件服务未配置，请联系管理员。' }
        }

        let successCount = 0
        let failCount = 0

        for (const user of users) {
            try {
                await resend.emails.send({
                    from: 'Updeal <noreply@updeal.xyz>',
                    to: [user.email!],
                    subject: `Your ${mData.name} coupon is expiring soon! 🍜`,
                    html: getExpirationReminderEmailTemplate({
                        name: user.name || '',
                        merchantName: mData.name || 'Merchant',
                        merchantAddress: (mData.address) || '',
                        merchantPhone: (mData.phone) || '',
                        merchantSlug: mData.slug
                    }),
                })
                successCount++
            } catch (e) {
                console.error(`Failed to send reminder to ${user.email}:`, e)
                failCount++
            }
            // Add a small delay between sends
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        // 5. Update last_reminder_sent_at and log campaign
        const now = new Date().toISOString()

        // Update merchant
        await supabase
            .from('merchants')
            .update({ last_reminder_sent_at: now })
            .eq('id', targetMerchantId)

        // Log campaign
        try {
            await supabase
                .from('reminder_campaigns')
                .insert({
                    merchant_id: targetMerchantId,
                    sent_at: now,
                    recipient_count: users.length,
                    success_count: successCount,
                    fail_count: failCount
                })
        } catch (e) {
            console.warn('Logging campaign failed:', e)
        }

        return {
            success: true,
            recipientCount: users.length,
            successCount,
            failCount,
            message: `发送完成！成功：${successCount}，失败：${failCount}`
        }

    } catch (error) {
        console.error('Error in sendExpirationRemindersAction:', error)
        return {
            success: false,
            error: '发送邮件时出错，请稍后重试'
        }
    }
}

/**
 * Get count of eligible recipients for reminders
 */
export async function getEligibleRecipientsCount(explicitMerchantId?: string): Promise<{ count: number; error?: string }> {
    try {
        let targetMerchantId: string;
        const supabase = createAdminClient();

        if (explicitMerchantId) {
            // Admin context
            const cookieStore = await cookies();
            const token = cookieStore.get('updeal_admin_session')?.value;
            if (!token) return { count: 0, error: '未授权' };
            const admin = await validateSession(token);
            if (!admin) return { count: 0, error: '未授权' };
            targetMerchantId = explicitMerchantId;
        } else {
            // Merchant context
            const session = await getMerchantSession()
            if (!session || !session.merchants) {
                return { count: 0, error: '未登录' }
            }
            targetMerchantId = session.merchants.id
        }

        const { data: coupons, error: cError } = await supabase
            .from('coupons')
            .select('user_id')
            .eq('merchant_id', targetMerchantId)
            .neq('status', 'redeemed')

        if (cError) return { count: 0, error: '获取优惠券失败' }

        const userIds = Array.from(new Set(coupons.map(c => c.user_id).filter(Boolean)))
        if (userIds.length === 0) return { count: 0 }

        const { count, error: uError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .in('id', userIds)
            .not('email', 'is', null)

        if (uError) return { count: 0, error: '获取客户失败' }

        return { count: count || 0 }
    } catch (error) {
        console.error('Error in getEligibleRecipientsCount:', error)
        return { count: 0, error: '统计失败' }
    }
}
