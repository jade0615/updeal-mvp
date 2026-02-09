import nodemailer from 'nodemailer';
import { generateICS, generateCalendarLinks } from './calendar';

// Email Service Configuration - Aliyun Direct Mail
const smtpConfig = {
  host: 'smtpdm.aliyun.com',
  port: 465,
  secure: true,
  auth: {
    user: 'info@hiraccoon.com',
    pass: 'Z2CrZ9punU97RaA',
  },
};

const transporter = nodemailer.createTransport(smtpConfig);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    contentType?: string;
  }>;
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  try {
    const result = await transporter.sendMail({
      from: process.env.EMAIL_SENDER || 'Hiraccoon <info@hiraccoon.com>',
      to,
      subject,
      html,
      attachments,
    });

    console.log('[Aliyun] Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('[Aliyun] Email sending failed:', error);
    return { success: false, error };
  }
}

/**
 * Basic Coupon Email (no calendar invite)
 */
export async function sendCouponEmail(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  expiresAt?: Date;
  offerValue?: string;
  offerDescription?: string;
  address?: string;
  verifyUrl?: string;
}) {
  const expiresText = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Valid for a limited time';

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Your Coupon is Ready</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Thanks for claiming your offer at <strong>${data.merchantName}</strong>.
      </p>

      ${data.offerValue ? `
        <div style="background: #f5f5f5; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 6px 0; color: #666; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Offer</p>
          <p style="margin: 0; color: #333; font-size: 20px; font-weight: 700;">${data.offerValue}</p>
          ${data.offerDescription ? `<p style="margin: 8px 0 0 0; color: #666; font-size: 13px;">${data.offerDescription}</p>` : ''}
        </div>
      ` : ''}

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Coupon Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Expires: <strong>${expiresText}</strong>
      </p>

      ${data.address ? `<p style="color: #666; font-size: 13px; margin: 16px 0;">Location: ${data.address}</p>` : ''}

      ${data.verifyUrl ? `
        <div style="margin: 20px 0;">
          <a href="${data.verifyUrl}"
             style="display: inline-block; background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
            View Coupon
          </a>
        </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated message. Please keep this email for your records.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `Your ${data.merchantName} coupon`,
    html,
  });
}

/**
 * T0: Immediate Confirmation Email with Calendar Invite
 */
export async function sendT0Confirmation(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  expectedDate: Date;
  address?: string;
  merchantSlug: string;
  referralCode?: string;
  offerValue?: string;
  offerDescription?: string;
}) {
  const icsContent = generateICS(data);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">Reservation Confirmed</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Thank you for your reservation at <strong>${data.merchantName}</strong>.
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you visit. Add this reservation to your calendar:
      </p>

      <div style="margin: 20px 0;">
        <a href="${generateCalendarLinks(data).google}"
           style="display: inline-block; background: #4285f4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
           Add to Calendar
        </a>
      </div>

      ${data.address ? `<p style="color: #666; font-size: 13px; margin: 20px 0;">Location: ${data.address}</p>` : ''}

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated confirmation. Please keep this email for your records.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `Reservation Confirmation - ${data.merchantName}`,
    html,
    attachments: [
      {
        filename: 'reservation.ics',
        content: icsContent,
        contentType: 'application/ics',
      },
    ],
  });
}

/**
 * T1: 24 Hours Before Reminder
 */
export async function sendT1Reminder(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  offerValue?: string;
  offerDescription?: string;
  address?: string;
  shareUrl?: string;
  heroImage?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 24px; margin-bottom: 20px;">⏰ Tomorrow is your appointment at ${data.merchantName}!</h2>

      ${data.heroImage ? `
        <img src="${data.heroImage}" alt="${data.merchantName}" style="width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" />
      ` : ''}

      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your reservation at <strong>${data.merchantName}</strong> is tomorrow.
      </p>

      ${data.offerValue ? `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
          <p style="margin: 0 0 8px 0; font-size: 16px; opacity: 0.9;">Your Special Offer</p>
          <p style="margin: 0; font-size: 28px; font-weight: 700;">${data.offerValue}</p>
          ${data.offerDescription ? `<p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${data.offerDescription}</p>` : ''}
        </div>
      ` : ''}

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you arrive.
      </p>

      ${data.address ? `
        <div style="margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px;">Location:</p>
          <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">${data.address}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}"
             style="display: inline-block; background: #34a853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
             📍 Get Directions
          </a>
        </div>
      ` : ''}

      <div style="background: #f0f7ff; border: 1px solid #2196f3; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">💡 Bring a friend and earn extra rewards!</p>
        <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">Share this experience with friends and both of you get benefits.</p>
        ${data.shareUrl ? `
          <a href="${data.shareUrl}"
             style="display: inline-block; background: #2196f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
             🎁 Share & Earn Rewards
          </a>
        ` : ''}
      </div>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder for your upcoming reservation.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `⏰ Tomorrow: Your appointment at ${data.merchantName}`,
    html,
  });
}

/**
 * T3: No-show Follow-up (Missed Visit)
 */
export async function sendT3NoShow(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  address?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Missed you yesterday!</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Was it a busy day? No worries!
      </p>

      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your offer for <strong>${data.merchantName}</strong> is <strong>still valid</strong> all week.
      </p>

      <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Active Coupon</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      ${data.address ? `
        <div style="background: #f0f7ff; border: 1px solid #4285f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; font-weight: 600;">📍 Location:</p>
          <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">${data.address}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}"
             style="display: inline-block; background: #34a853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
             Get Directions
          </a>
        </div>
      ` : ''}

      <p style="color: #555; font-size: 14px; line-height: 1.5; margin-top: 20px;">
        Come by whenever you're hungry!
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated message regarding your reservation.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `Your ${data.merchantName} coupon is still waiting for you! 🎁`,
    html,
  });
}

/**
 * T2: Morning of Visit Reminder
 */
export async function sendT2FinalCall(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  heroImage?: string;
  address?: string;
}) {
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Today's Reservation</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your reservation at <strong>${data.merchantName}</strong> is today.
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you arrive.
      </p>

      ${data.address ? `
        <div style="background: #f0f7ff; border: 1px solid #4285f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; font-weight: 600;">📍 Location:</p>
          <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">${data.address}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}"
             style="display: inline-block; background: #34a853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
             Get Directions
          </a>
        </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder for your reservation today.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `Today: ${data.merchantName} reservation`,
    html,
  });
}

/**
 * T4: Expiration Warning (3 Days Before Expiry)
 */
export async function sendT4ExpirationWarning(data: {
  email: string;
  merchantName: string;
  couponCode: string;
  expiresAt: Date;
  shareUrl?: string;
  address?: string;
}) {
  const daysLeft = Math.ceil((data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #d32f2f; font-size: 22px; margin-bottom: 20px;">⏰ Your Coupon Expires in ${daysLeft} Days</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your reservation coupon for <strong>${data.merchantName}</strong> will expire soon.
      </p>

      <div style="background: #fff3e0; border-left: 4px solid #ff9800; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
        Don't miss out! Visit soon to enjoy your reservation.
      </p>

      ${data.address ? `
        <div style="background: #f0f7ff; border: 1px solid #4285f4; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; font-weight: 600;">📍 Location:</p>
          <p style="margin: 0 0 12px 0; color: #333; font-size: 14px;">${data.address}</p>
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.address)}"
             style="display: inline-block; background: #34a853; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
             Get Directions
          </a>
        </div>
      ` : ''}

      ${data.shareUrl ? `
      <div style="background: #fff9e6; border: 1px solid #ffc107; border-radius: 8px; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #333; font-size: 14px; font-weight: 600;">🎁 Can't use it? Share with friends!</p>
        <p style="margin: 0 0 12px 0; color: #666; font-size: 13px;">Your friends get a great deal, and you earn rewards.</p>
        <a href="${data.shareUrl}"
           style="display: inline-block; background: #ff9800; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-size: 14px;">
           Share Now
        </a>
      </div>
      ` : ''}

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder about your expiring coupon.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `⏰ ${data.merchantName} - Coupon expires in ${daysLeft} days`,
    html,
  });
}
