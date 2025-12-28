import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { couponCode, merchantId } = body

        if (!couponCode) {
            return NextResponse.json(
                { error: 'Coupon code is required', errorCode: 'MISSING_CODE' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // Query coupon with relations
        const { data: coupon, error: fetchError } = await supabase
            .from('coupons')
            .select(`
        id,
        code,
        status,
        expires_at,
        redeemed_at,
        merchant_id,
        user_id,
        merchants (
          id,
          name,
          content
        ),
        users (
          phone,
          name
        )
      `)
            .eq('code', couponCode.trim().toUpperCase())
            .single()

        if (fetchError || !coupon) {
            return NextResponse.json(
                {
                    error: 'Coupon not found',
                    errorCode: 'NOT_FOUND',
                    message: `优惠券 ${couponCode} 不存在`
                },
                { status: 404 }
            )
        }

        // Check Merchant ownership
        if (merchantId && coupon.merchant_id !== merchantId) {
            return NextResponse.json(
                {
                    error: 'Wrong merchant',
                    errorCode: 'WRONG_MERCHANT',
                    message: '此优惠券不属于本商家'
                },
                { status: 403 }
            )
        }

        // Check Status
        if (coupon.status === 'redeemed') {
            const redeemedAt = coupon.redeemed_at
                ? new Date(coupon.redeemed_at).toLocaleString('zh-CN', { hour12: false })
                : '未知时间'

            return NextResponse.json({
                success: false,
                errorCode: 'ALREADY_REDEEMED',
                message: `此优惠券已于 ${redeemedAt} 核销`
            })
        }

        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return NextResponse.json({
                success: false,
                errorCode: 'EXPIRED',
                message: '此优惠券已过期'
            })
        }

        if (coupon.status !== 'active') {
            return NextResponse.json({
                success: false,
                errorCode: 'INVALID_STATUS',
                message: `优惠券状态异常: ${coupon.status}`
            })
        }

        // Prepare Success Response Data
        // Use the offer title from merchant content if available, fallback to generic
        const merchantData = coupon.merchants as any
        const userData = coupon.users as any
        // Try to find the offer title. Usually stored in content.offer.value or content.offerDiscount.
        const offerTitle = merchantData?.content?.offer?.value || merchantData?.content?.offerDiscount || merchantData?.content?.offer_value || '优惠券'

        // Mask phone for privacy
        const rawPhone = userData?.phone || ''
        const maskedPhone = rawPhone.length > 4
            ? `***${rawPhone.slice(-4)}`
            : rawPhone || '未知号码'

        return NextResponse.json({
            success: true,
            coupon: {
                code: coupon.code,
                name: offerTitle,
                customerName: userData?.name || '顾客',
                customerPhone: maskedPhone
            }
        })

    } catch (error: any) {
        console.error('Verify coupon error:', error)
        return NextResponse.json(
            {
                error: error.message || 'Internal server error',
                errorCode: 'SERVER_ERROR',
                message: '验证失败，请重试'
            },
            { status: 500 }
        )
    }
}
