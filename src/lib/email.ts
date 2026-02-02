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
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #FF5722;">Almost time! 🍽️</h2>
      <p>Don't let your <strong>50% OFF</strong> at ${data.merchantName} expire!</p>
      <p>We're looking forward to seeing you tomorrow.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; border-left: 4px solid #FF5722;">
         <strong>Code: ${data.couponCode}</strong>
      </div>
      <p>See you soon!</p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `明天见！您的优惠券已准备好 (See you tomorrow!)`,
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
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #FF5722;">Missed you yesterday! 🥺</h2>
      <p>Was it a busy day? No worries!</p>
      <p>Your offer for <strong>${data.merchantName}</strong> is <strong>still valid</strong> all week.</p>
      
      <p>“是不是太忙忘记了？您的优惠依然有效，这周随时过来吧！”</p>
      
      <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px dashed #FF5722;">
         <p style="margin: 0; color: #E65100; font-size: 12px;">ACTIVE COUPON</p>
         <strong style="font-size: 24px;">${data.couponCode}</strong>
      </div>
      
      <p>Come by whenever you're hungry!</p>
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
}) {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; text-align: center;">
      ${data.heroImage ? `<img src="${data.heroImage}" style="width: 100%; border-radius: 10px; margin-bottom: 20px;" />` : ''}
      <h2 style="color: #FF5722;">Hungry yet? 😋</h2>
      <p>Today is the day! Your table at <strong>${data.merchantName}</strong> is waiting.</p>
      <p>Show this email to get your discount: <strong style="font-size: 20px;">${data.couponCode}</strong></p>
      <a href="https://hiraccoon.com/verify/${data.couponCode}" style="color: #FF5722;">View Directions</a>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `See you today at ${data.merchantName}!`,
    html,
  });
}
