'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export interface ReferralRecord {
    // 被推荐人信息
    invitee_coupon_id: string
    invitee_name: string | null
    invitee_phone: string
    invitee_email: string | null
    invitee_coupon_code: string
    invitee_claimed_at: string
    invitee_merchant_name: string
    // 推荐人信息
    referral_code: string        // REF-xxxxxx
    referrer_name: string | null
    referrer_phone: string | null
    referrer_email: string | null
    referrer_coupon_code: string | null
}

/**
 * 获取所有推荐关系（谁分享给谁）
 * Logic:
 *   - coupons.referred_by = "REF-xxxxxx" (用户A user_id 前6位大写)
 *   - users.id LIKE xxxxxx% 即为推荐人
 */
export async function getReferralChains(merchantId?: string): Promise<{
    success: boolean
    records: ReferralRecord[]
    total: number
    error?: string
}> {
    const supabase = createAdminClient()

    try {
        // 1. 拿所有有 referred_by 的 coupon（即被推荐人的 coupon）
        let inviteeQuery = supabase
            .from('coupons')
            .select(`
                id,
                code,
                referred_by,
                created_at,
                user_id,
                users!inner (
                    id,
                    phone,
                    email,
                    name
                ),
                merchants!inner (
                    id,
                    name
                )
            `)
            .not('referred_by', 'is', null)
            .order('created_at', { ascending: false })

        if (merchantId) {
            inviteeQuery = inviteeQuery.eq('merchant_id', merchantId)
        }

        const { data: invitees, error: inviteesError } = await inviteeQuery

        if (inviteesError) {
            console.error('getReferralChains invitees error:', inviteesError)
            return { success: false, records: [], total: 0, error: inviteesError.message }
        }

        if (!invitees || invitees.length === 0) {
            return { success: true, records: [], total: 0 }
        }

        // 2. 收集所有不重复的 referral codes
        const referralCodes = [...new Set(invitees.map((i: any) => i.referred_by as string))]

        // 3. 根据 referral code 反查推荐人
        // referral code 格式: REF-XXXXXX，XXXXXX 是 user_id 前6位（大写）
        // 找每个 ref code 对应的 user
        const referrerMap: Record<string, {
            name: string | null
            phone: string
            email: string | null
            coupon_code: string | null
        }> = {}

        for (const refCode of referralCodes) {
            // 提取 user_id 前缀：REF-XXXXXX → xxxxxx（小写）
            const prefix = refCode.replace('REF-', '').toLowerCase()

            // 查找 user_id 以该前缀开头的用户
            const { data: referrerUsers } = await supabase
                .from('users')
                .select('id, name, phone, email')
                .ilike('id', `${prefix}%`)
                .limit(1)

            if (referrerUsers && referrerUsers.length > 0) {
                const referrer = referrerUsers[0]
                // 查找该推荐人的 coupon（同商家或任意）
                const { data: referrerCoupons } = await supabase
                    .from('coupons')
                    .select('code')
                    .eq('user_id', referrer.id)
                    .limit(1)

                referrerMap[refCode] = {
                    name: referrer.name,
                    phone: referrer.phone,
                    email: referrer.email,
                    coupon_code: referrerCoupons?.[0]?.code || null
                }
            }
        }

        // 4. 组装结果
        const records: ReferralRecord[] = invitees.map((item: any) => {
            const refCode = item.referred_by as string
            const referrer = referrerMap[refCode]

            return {
                invitee_coupon_id: item.id,
                invitee_name: item.users?.name || null,
                invitee_phone: item.users?.phone || '',
                invitee_email: item.users?.email || null,
                invitee_coupon_code: item.code,
                invitee_claimed_at: item.created_at,
                invitee_merchant_name: item.merchants?.name || '',
                referral_code: refCode,
                referrer_name: referrer?.name || null,
                referrer_phone: referrer?.phone || null,
                referrer_email: referrer?.email || null,
                referrer_coupon_code: referrer?.coupon_code || null,
            }
        })

        return { success: true, records, total: records.length }

    } catch (err: any) {
        console.error('getReferralChains error:', err)
        return { success: false, records: [], total: 0, error: 'Internal Server Error' }
    }
}
