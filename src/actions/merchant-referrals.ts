'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getMerchantSession } from '@/lib/merchant-auth'

export interface MerchantReferralRecord {
    // 被推荐人（领券者）
    invitee_coupon_id: string
    invitee_name: string | null
    invitee_phone: string
    invitee_email: string | null
    invitee_coupon_code: string
    invitee_claimed_at: string
    // 推荐人（分享者）
    referral_code: string
    referrer_name: string | null
    referrer_phone: string | null
    referrer_email: string | null
    referrer_coupon_code: string | null
}

export async function getMerchantReferrals(): Promise<{
    success: boolean
    records: MerchantReferralRecord[]
    total: number
    merchantName: string
    error?: string
}> {
    try {
        const session = await getMerchantSession()
        if (!session || !session.merchants) {
            return { success: false, records: [], total: 0, merchantName: '', error: '未登录，请先登录商家账号' }
        }

        const merchant = session.merchants
        const merchantId = merchant.id
        const supabase = createAdminClient()

        // 1. 获取该商家下所有有 referred_by 的 coupon（被推荐人领的券）
        const { data: invitees, error } = await supabase
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
                )
            `)
            .eq('merchant_id', merchantId)
            .not('referred_by', 'is', null)
            .order('created_at', { ascending: false })

        if (error) {
            return { success: false, records: [], total: 0, merchantName: merchant.name, error: error.message }
        }

        if (!invitees || invitees.length === 0) {
            return { success: true, records: [], total: 0, merchantName: merchant.name }
        }

        // 2. 反查推荐人信息（REF-XXXXXX → user_id 前缀，内存匹配）
        const referralCodes = [...new Set(invitees.map((i: any) => i.referred_by as string))]
        const referrerMap: Record<string, {
            name: string | null
            phone: string | null
            email: string | null
            coupon_code: string | null
        }> = {}

        // 先拉该商家所有 coupons（用来内存内匹配 user_id 前缀）
        const { data: allMerchantCoupons } = await supabase
            .from('coupons')
            .select('id, code, user_id, created_at')
            .eq('merchant_id', merchantId)
            .order('created_at', { ascending: true })

        for (const refCode of referralCodes) {
            const prefix = refCode.replace('REF-', '').toLowerCase()

            const matchingCoupon = (allMerchantCoupons || []).find(
                (c: any) => c.user_id && c.user_id.toLowerCase().startsWith(prefix)
            )

            if (matchingCoupon) {
                const { data: userRows } = await supabase
                    .from('users')
                    .select('id, name, phone, email')
                    .eq('id', matchingCoupon.user_id)
                    .limit(1)

                const referrer = userRows?.[0]
                if (referrer) {
                    referrerMap[refCode] = {
                        name: referrer.name,
                        phone: referrer.phone,
                        email: referrer.email,
                        coupon_code: matchingCoupon.code,
                    }
                }
            }
        }

        // 3. 组装
        const records: MerchantReferralRecord[] = invitees.map((item: any) => {
            const refCode = item.referred_by as string
            const referrer = referrerMap[refCode]
            return {
                invitee_coupon_id: item.id,
                invitee_name: item.users?.name || null,
                invitee_phone: item.users?.phone || '',
                invitee_email: item.users?.email || null,
                invitee_coupon_code: item.code,
                invitee_claimed_at: item.created_at,
                referral_code: refCode,
                referrer_name: referrer?.name || null,
                referrer_phone: referrer?.phone || null,
                referrer_email: referrer?.email || null,
                referrer_coupon_code: referrer?.coupon_code || null,
            }
        })

        return { success: true, records, total: records.length, merchantName: merchant.name }
    } catch (err: any) {
        console.error('getMerchantReferrals error:', err)
        return { success: false, records: [], total: 0, merchantName: '', error: '获取推荐记录失败' }
    }
}
