import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { customAlphabet } from 'nanoid';
import { trackCouponClaim } from '@/actions/analytics';
import { sendClaimNotification } from '@/lib/notifications';
import { backupToGoogleSheets } from '@/lib/backup';

export const dynamic = 'force-dynamic';

// Create a generator for the code suffix (4 chars, uppercase + numbers)
const generateSuffix = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 4);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, phone, name } = body;

    if (!merchantId || !phone) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // 1. Get Merchant to generate code prefix and check validity
    const { data: merchant, error: merchantError } = await supabase
      .from('merchants')
      .select('id, name, content')
      .eq('id', merchantId)
      .single();

    if (merchantError || !merchant) {
      return NextResponse.json(
        { success: false, error: 'Merchant not found' },
        { status: 404 }
      );
    }

    // 2. Find or Create User
    let userId: string;
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      userId = existingUser.id;

      // 更新用户姓名（如果提供了新的姓名）
      if (name) {
        await supabase
          .from('users')
          .update({ name })
          .eq('id', userId);
      }

      // Check if user already claimed this coupon (Optional: limit 1 per user)
      const { data: existingCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('user_id', userId)
        .single();

      if (existingCoupon) {
        // Return existing coupon
        return NextResponse.json({
          success: true,
          coupon: {
            code: existingCoupon.code,
            expiresAt: existingCoupon.expires_at,
            merchant: merchant.name,
            offerValue: merchant.content?.offer?.value || 'Special Offer'
          },
          isExisting: true,
          verifyUrl: `/verify/${existingCoupon.code}`
        });
      }

    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone,
          name: name || undefined,
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        console.error('Error creating user:', createError);
        return NextResponse.json(
          { success: false, error: 'Failed to register user' },
          { status: 500 }
        );
      }
      userId = newUser.id;
    }

    // 3. Generate Coupon Code
    // Prefix: First 4 chars of name, stripped of spaces, uppercase
    const prefix = merchant.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const code = `${prefix}-${generateSuffix()}`;

    // Expiration: 30 days from now default
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // 4. Create Coupon
    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        merchant_id: merchantId,
        user_id: userId,
        code,
        status: 'active',
        expires_at: expiresAt.toISOString()
      });

    // 无论数据库写入是否成功，都尝试备份和发送通知 (保障数据不丢失)
    // 即使数据库挂了，通过邮件和 Google Sheets也能找回领取记录
    const backupPromise = backupToGoogleSheets({
      merchantId,
      merchantName: merchant.name,
      phone,
      name: name || '',
      couponCode: code,
      claimedAt: new Date().toISOString(),
    }).catch(err => console.error('[Fatal] Backup to Google Sheets failed:', err));

    const notificationPromise = sendClaimNotification({
      merchantId,
      merchantName: merchant.name,
      phone,
      name: name || '',
      couponCode: code,
    }).catch(err => console.error('[Fatal] Send notification failed:', err));

    if (couponError) {
      console.error('Error creating coupon in Supabase:', couponError);
      // 虽然 DB 失败，但我们已经触发了备份。
      // 如果备份成功，我们依然可以给用户显示成功，或者返回错误但记录已存
      // 为了用户体验和容错，即使 DB 失败，只要备份在进行，我们也返回成功
      // 等待备份完成以确保数据安全
      await Promise.all([backupPromise, notificationPromise]);
    } else {
      // Track coupon claim for analytics (update stats)
      await trackCouponClaim(merchantId, userId, code);
    }

    return NextResponse.json({
      success: true,
      coupon: {
        code,
        expiresAt: expiresAt.toISOString(),
        merchant: merchant.name,
        offerValue: merchant.content?.offer?.value || 'Special Offer'
      },
      isExisting: false,
      verifyUrl: `/verify/${code}`
    });

  } catch (error) {
    console.error('Claim API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
