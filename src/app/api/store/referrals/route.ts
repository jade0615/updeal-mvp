import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const slug = searchParams.get('slug')

    if (!slug) {
        return NextResponse.json({ success: false, error: 'Missing slug' }, { status: 400 })
    }

    const supabase = createAdminClient()

    try {
        // 1. 通过 slug 获取商家 ID
        const { data: merchant, error: merchantError } = await supabase
            .from('merchants')
            .select('id, name')
            .eq('slug', slug)
            .single()

        if (merchantError || !merchant) {
            return NextResponse.json({ success: false, error: 'Merchant not found' }, { status: 404 })
        }

        // 2. 获取该商家所有有 referred_by 的券（被推荐人领的券）
        const { data: invitees, error: inviteesError } = await supabase
            .from('coupons')
            .select(`
                id,
                code,
                referred_by,
                created_at,
                users!inner (
                    id,
                    phone,
                    email,
                    name
                )
            `)
            .eq('merchant_id', merchant.id)
            .not('referred_by', 'is', null)
            .order('created_at', { ascending: false })

        if (inviteesError) {
            return NextResponse.json({ success: false, error: inviteesError.message }, { status: 500 })
        }

        if (!invitees || invitees.length === 0) {
            return NextResponse.json({ success: true, referrals: [], total: 0 })
        }

        // 3. 反查推荐人信息
        // REF-XXXXXX → XXXXXX 是 user_id 前 6 位（大写）
        // UUID 字段不支持 ilike，改为先查该商家所有 coupons，
        // 在内存中找 user_id 前缀匹配，再精确查 users 表
        const referralCodes = [...new Set(invitees.map((i: any) => i.referred_by as string))]
        const referrerMap: Record<string, {
            name: string | null
            phone: string | null
            email: string | null
            coupon_code: string | null
            referred_at: string | null
        }> = {}

        // Fetch all coupons for this merchant to search user_id prefixes in memory
        const { data: allMerchantCoupons } = await supabase
            .from('coupons')
            .select('id, code, user_id, created_at')
            .eq('merchant_id', merchant.id)
            .order('created_at', { ascending: true })

        for (const refCode of referralCodes) {
            const prefix = refCode.replace('REF-', '').toLowerCase()

            // Find coupon whose user_id starts with prefix
            const matchingCoupon = (allMerchantCoupons || []).find(
                (c: any) => c.user_id && c.user_id.toLowerCase().startsWith(prefix)
            )

            if (matchingCoupon) {
                // Exact lookup of the user by user_id
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
                        referred_at: matchingCoupon.created_at,
                    }
                }
            }
        }

        // 4. 组装结果
        const referrals = invitees.map((item: any) => {
            const refCode = item.referred_by as string
            const referrer = referrerMap[refCode]
            return {
                // 被推荐人
                invitee_name: item.users?.name || null,
                invitee_phone: item.users?.phone || '',
                invitee_email: item.users?.email || null,
                invitee_coupon_code: item.code,
                invitee_claimed_at: item.created_at, // 朋友领券时间

                // 推荐人
                referral_code: refCode,
                referrer_name: referrer?.name || null,
                referrer_phone: referrer?.phone || null,
                referrer_email: referrer?.email || null,
                referrer_coupon_code: referrer?.coupon_code || null,
                referrer_claimed_at: referrer?.referred_at || null, // 推荐人自己领券时间（即"分享者"最早领券时间）
            }
        })

        return NextResponse.json({ success: true, referrals, total: referrals.length })

    } catch (err: any) {
        console.error('store referrals API error:', err)
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 })
    }
}
