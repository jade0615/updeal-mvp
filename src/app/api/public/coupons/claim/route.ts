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
    const { merchantId, phone, name, email, expectedVisitDate, referralCode } = body;

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
      .select('id, name, slug, content')
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
    let userEmail = email;

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      userId = existingUser.id;
      userEmail = userEmail || existingUser.email;

      // 更新用户姓名和邮箱（如果提供了新信息）
      const updates: any = {};
      if (name) updates.name = name;
      if (email) updates.email = email;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('users')
          .update(updates)
          .eq('id', userId);
      }

      // Check if user already claimed this coupon
      const { data: existingCoupon } = await supabase
        .from('coupons')
        .select('*')
        .eq('merchant_id', merchantId)
        .eq('user_id', userId)
        .single();

      if (existingCoupon) {
        // 补发邮件逻辑：如果是老用户重新领取，且之前没发过邮件（stage=0），且现在有时间了
        let t0Success = false;
        if (userEmail && expectedVisitDate && existingCoupon.email_sent_stage === 0) {
          console.log('[Claim API] Existing coupon found, processing missing T0 email...');

          // 1. 更新预约时间
          await supabase
            .from('coupons')
            .update({ expected_visit_date: new Date(expectedVisitDate).toISOString() })
            .eq('id', existingCoupon.id);

          // 2. 发送邮件
          const { sendT0Confirmation } = await import('@/lib/email');
          const referralCode = `REF-${userId.substring(0, 6).toUpperCase()}`;

          const emailRes = await sendT0Confirmation({
            email: userEmail,
            merchantName: merchant.name,
            couponCode: existingCoupon.code,
            expectedDate: new Date(expectedVisitDate),
            address: merchant.content?.address?.fullAddress,
            merchantSlug: merchant.slug,
            referralCode: referralCode,
            offerValue: merchant.content?.offer?.value || 'Special Offer',
            offerDescription: merchant.content?.offer?.description || ''
          });

          if (emailRes.success) {
            t0Success = true;
            await supabase.from('coupons').update({ email_sent_stage: 1 }).eq('id', existingCoupon.id);
          }
        }

        // Generate referral code for sharing
        const userReferralCode = `REF-${userId.substring(0, 6).toUpperCase()}`;

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
          verifyUrl: `/verify/${existingCoupon.code}`,
          emailSent: t0Success,
          referralCode: userReferralCode,
          merchantSlug: merchant.slug,
          shareUrl: `https://hiraccoon.com/${merchant.slug}?uid=${userReferralCode}`
        });
      }

    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          phone,
          name: name || undefined,
          email: email || undefined,
        })
        .select('id')
        .single();

      if (createError || !newUser) {
        return NextResponse.json(
          { success: false, error: 'Failed to register user' },
          { status: 500 }
        );
      }
      userId = newUser.id;
    }

    // 3. Generate Coupon Code
    const prefix = merchant.name.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
    const code = `${prefix}-${generateSuffix()}`;

    // Expiration: 7 days from now default
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // 4. Create Coupon
    const { error: couponError } = await supabase
      .from('coupons')
      .insert({
        merchant_id: merchantId,
        user_id: userId,
        code,
        status: 'active',
        expires_at: expiresAt.toISOString(),
        expected_visit_date: expectedVisitDate ? new Date(expectedVisitDate).toISOString() : null,
        email_sent_stage: 0,
        referred_by: referralCode || null
      });

    if (couponError) {
      console.error('Coupon DB Error:', couponError);
    }

    // 5. Automatic Email Trigger (T0)
    // If we have an email and a visit date, send the immediate calendar invite
    const shouldSendT0 = userEmail && expectedVisitDate;
    let t0Success = false;

    console.log('[Claim API] Checking T0 Trigger:', {
      shouldSendT0,
      userEmail,
      expectedVisitDate,
      merchantName: merchant.name
    });

    if (shouldSendT0) {
      const { sendT0Confirmation } = await import('@/lib/email');

      // Generate referral code for this user (First 6 chars of User ID)
      const referralCode = `REF-${userId.substring(0, 6).toUpperCase()}`;

      console.log('[Claim API] Sending T0 Confirmation...');
      const emailRes = await sendT0Confirmation({
        email: userEmail,
        merchantName: merchant.name,
        couponCode: code,
        expectedDate: new Date(expectedVisitDate),
        address: merchant.content?.address?.fullAddress,
        merchantSlug: merchant.slug,
        referralCode: referralCode,
        offerValue: merchant.content?.offer?.value || merchant.content?.offer_value || 'Special Offer',
        offerDescription: merchant.content?.offer?.description || merchant.content?.offerDescription || ''
      });
      console.log('[Claim API] T0 Result:', emailRes);

      if (emailRes.success) {
        t0Success = true;
        await supabase.from('coupons').update({ email_sent_stage: 1 }).eq('code', code);
      }
    }

    // Backup & Notifications
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

    await trackCouponClaim(merchantId, userId, code);

    // Generate referral code for sharing
    const userReferralCode = `REF-${userId.substring(0, 6).toUpperCase()}`;

    return NextResponse.json({
      success: true,
      coupon: {
        code,
        expiresAt: expiresAt.toISOString(),
        merchant: merchant.name,
        offerValue: merchant.content?.offer?.value || 'Special Offer'
      },
      isExisting: false,
      verifyUrl: `/verify/${code}`,
      emailSent: t0Success,
      referralCode: userReferralCode,
      merchantSlug: merchant.slug,
      shareUrl: `https://hiraccoon.com/${merchant.slug}?uid=${userReferralCode}`
    });


  } catch (error) {
    console.error('Claim API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
