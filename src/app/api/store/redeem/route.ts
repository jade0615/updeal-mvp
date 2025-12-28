import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

/**
 * 店内核销API
 * 店员使用店内设备核销优惠券，无需PIN验证
 * 安全性依赖物理隔离（店内设备）
 */
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

    // 1. 通过code查询coupon及相关信息
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
          phone
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

    // 2. 如果指定了merchantId，验证优惠券是否属于该商户
    if (merchantId && coupon.merchant_id !== merchantId) {
      return NextResponse.json(
        {
          error: 'Wrong merchant',
          errorCode: 'WRONG_MERCHANT',
          message: '此优惠券不属于本商家，无法核销',
          success: false
        },
        { status: 403 }
      )
    }

    // 3. 检查是否已核销
    if (coupon.status === 'redeemed') {
      const redeemedDate = coupon.redeemed_at
        ? new Date(coupon.redeemed_at).toLocaleString('zh-CN')
        : '未知时间'

      return NextResponse.json(
        {
          error: 'Already redeemed',
          errorCode: 'ALREADY_REDEEMED',
          message: `此优惠券已于 ${redeemedDate} 核销`,
          coupon: {
            code: coupon.code,
            merchant: (coupon.merchants as any)?.name,
            redeemedAt: coupon.redeemed_at
          }
        },
        { status: 400 }
      )
    }

    // 4. 检查是否过期
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        {
          error: 'Coupon expired',
          errorCode: 'EXPIRED',
          message: '此优惠券已过期'
        },
        { status: 400 }
      )
    }

    // 5. 检查状态
    if (coupon.status !== 'active') {
      return NextResponse.json(
        {
          error: 'Invalid coupon status',
          errorCode: 'INVALID_STATUS',
          message: `优惠券状态异常: ${coupon.status}`
        },
        { status: 400 }
      )
    }

    // 6. 核销优惠券
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        status: 'redeemed',
        redeemed_at: now
      })
      .eq('id', coupon.id)

    if (updateError) {
      console.error('Error redeeming coupon:', updateError)
      return NextResponse.json(
        {
          error: 'Failed to redeem coupon',
          errorCode: 'UPDATE_FAILED',
          message: '核销失败，请重试'
        },
        { status: 500 }
      )
    }

    // 7. 记录核销事件
    await supabase.from('events').insert({
      event_type: 'coupon_redeem',
      merchant_id: coupon.merchant_id,
      user_id: coupon.user_id,
      metadata: {
        coupon_code: coupon.code,
        coupon_id: coupon.id,
        redeemed_at: now,
        redeem_method: merchantId ? 'merchant_terminal' : 'store_terminal', // 区分商户专属终端和通用终端
        merchant_id_verified: merchantId ? true : false
      }
    })

    // 8. 返回成功结果
    const merchant = coupon.merchants as any
    const user = coupon.users as any
    const phoneLastFour = user?.phone?.slice(-4) || '****'

    return NextResponse.json({
      success: true,
      message: '核销成功！',
      coupon: {
        code: coupon.code,
        merchant: merchant?.name || 'N/A',
        offer: merchant?.content?.offer?.value || merchant?.content?.offerDiscount || merchant?.content?.offer_value || '优惠',
        customer: `***${phoneLastFour}`,
        redeemedAt: now
      }
    })

  } catch (error: any) {
    console.error('Store redeem error:', error)
    return NextResponse.json(
      {
        error: error.message || 'Internal server error',
        errorCode: 'SERVER_ERROR',
        message: '系统错误，请联系技术支持'
      },
      { status: 500 }
    )
  }
}
