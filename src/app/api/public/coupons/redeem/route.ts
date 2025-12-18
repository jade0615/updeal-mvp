import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponId, pin } = body

    if (!couponId) {
      return NextResponse.json(
        { error: 'couponId is required' },
        { status: 400 }
      )
    }

    if (!pin) {
      return NextResponse.json(
        { error: 'Store PIN is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Fetch the coupon to verify it exists and is valid
    const { data: coupon, error: fetchError } = await supabase
      .from('coupons')
      .select('id, code, status, expires_at, merchant_id, user_id')
      .eq('id', couponId)
      .single()

    if (fetchError || !coupon) {
      return NextResponse.json(
        { error: 'Coupon not found' },
        { status: 404 }
      )
    }

    // 2. Verify merchant PIN
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, redeem_pin')
      .eq('id', coupon.merchant_id)
      .single()

    if (merchantError || !merchant) {
      return NextResponse.json(
        { error: 'Merchant not found' },
        { status: 404 }
      )
    }

    // Check if merchant has a PIN configured
    if (!merchant.redeem_pin) {
      return NextResponse.json(
        { error: 'Store PIN not configured. Please contact support.' },
        { status: 403 }
      )
    }

    // Verify PIN matches
    if (merchant.redeem_pin !== pin.trim()) {
      return NextResponse.json(
        { error: 'Invalid store PIN' },
        { status: 403 }
      )
    }

    // 3. Check if already redeemed
    if (coupon.status === 'redeemed') {
      return NextResponse.json(
        { error: 'Coupon has already been redeemed' },
        { status: 400 }
      )
    }

    // 4. Check if expired
    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return NextResponse.json(
        { error: 'Coupon has expired' },
        { status: 400 }
      )
    }

    // 5. Check if status is active
    if (coupon.status !== 'active') {
      return NextResponse.json(
        { error: 'Coupon is not active' },
        { status: 400 }
      )
    }

    // 6. Redeem the coupon
    const now = new Date().toISOString()
    const { error: updateError } = await supabase
      .from('coupons')
      .update({
        status: 'redeemed',
        redeemed_at: now
      })
      .eq('id', couponId)

    if (updateError) {
      console.error('Error redeeming coupon:', updateError)
      return NextResponse.json(
        { error: 'Failed to redeem coupon' },
        { status: 500 }
      )
    }

    // 7. Track redemption event
    await supabase.from('events').insert({
      event_type: 'coupon_redeem',
      merchant_id: coupon.merchant_id,
      user_id: coupon.user_id,
      metadata: {
        coupon_code: coupon.code,
        coupon_id: coupon.id,
        redeemed_at: now
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Coupon redeemed successfully',
      redeemedAt: now
    })
  } catch (error: any) {
    console.error('Coupon redemption error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
