import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic';

/**
 * 验证商户店内密码
 * 允许店员访问该商户的核销页面
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { merchantSlug, pin } = body

    if (!merchantSlug || !pin) {
      return NextResponse.json(
        {
          success: false,
          message: '缺少必要参数'
        },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 查询商户信息
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, slug, redeem_pin')
      .eq('slug', merchantSlug)
      .single()

    if (merchantError || !merchant) {
      return NextResponse.json(
        {
          success: false,
          message: '商户不存在'
        },
        { status: 404 }
      )
    }

    // 验证PIN码
    if (!merchant.redeem_pin) {
      return NextResponse.json(
        {
          success: false,
          message: '该商户未设置核销密码，请联系管理员'
        },
        { status: 400 }
      )
    }

    if (merchant.redeem_pin !== pin.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: '密码错误，请重试'
        },
        { status: 401 }
      )
    }

    // 验证成功
    return NextResponse.json({
      success: true,
      merchantId: merchant.id,
      merchantName: merchant.name,
      message: '验证成功'
    })

  } catch (error: any) {
    console.error('Store PIN verification error:', error)
    return NextResponse.json(
      {
        success: false,
        message: '系统错误，请重试'
      },
      { status: 500 }
    )
  }
}
