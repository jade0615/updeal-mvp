import nodemailer from 'nodemailer';
import { generateICS, generateCalendarLinks } from './calendar';

// Email Service Configuration
// For Production: Swap these with SendGrid or AWS SES credentials
// For Production: Swap these with SendGrid or AWS SES credentials
// FORCE HARDCODED CONFIG To Fix Vercel Env Issues
const port = 465;
const smtpConfig = {
  host: 'smtpdm.aliyun.com', // Must be smtpdm for Direct Mail
  port: port,
  secure: true, // SSL
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
  attachments?: any[];
}

export async function sendEmail({ to, subject, html, attachments }: SendEmailParams) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_SENDER || `"Hiraccoon" <info@hiraccoon.com>`,
      to,
      subject,
      html,
      attachments,
    });
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
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
  const shareUrl = `https://hiraccoon.com/${data.merchantSlug}${data.referralCode ? `?uid=${data.referralCode}` : ''}`;
  const offerText = data.offerValue ? `Get ${data.offerValue} at ${data.merchantName}!` : `Check out this deal at ${data.merchantName}!`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
      <h1 style="color: #FF5722;">You're In! 🎉</h1>
      <p>Your visit to <strong>${data.merchantName}</strong> is confirmed.</p>
      
      <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #E65100; font-size: 14px;">YOUR COUPON CODE</p>
        <h2 style="margin: 5px 0; letter-spacing: 2px;">${data.couponCode}</h2>
      </div>

      <p>Save this to your calendar so you don't miss out on your special offer!</p>
      
      <div style="margin: 30px 0;">
        <a href="${generateCalendarLinks(data).google}" 
           style="background: #FF5722; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
           Add to Google Calendar
        </a>
      </div>

      <p style="color: #666; font-size: 12px;">Restaurant Address: ${data.address || 'Check in store'}</p>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
      
      <p style="font-size: 16px; margin-bottom: 15px;">Love this deal? <strong>Share it with your friends!</strong> 👯‍♀️</p>
      <p style="font-size: 14px; color: #666; margin-bottom: 15px;">Share your unique link. When they redeem, you get rewards!</p>
      
      <div style="margin-bottom: 20px;">
        <!-- Facebook -->
        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" 
           style="display: inline-block; background: #1877F2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 5px; font-size: 14px;">
           Facebook
        </a>
        
        <!-- Instagram (Note: Direct sharing via web link is limited, usually points to profile or app) -->
        <a href="https://www.instagram.com/" 
           style="display: inline-block; background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 5px; font-size: 14px;">
           Instagram
        </a>

        <!-- SMS (Mobile) -->
        <a href="sms:?body=${encodeURIComponent(`${offerText} ${shareUrl}`)}" 
           style="display: inline-block; background: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 5px; font-size: 14px;">
           Message
        </a>
      </div>

      <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; margin-top: 20px;">
        <p style="font-size: 12px; color: #888; margin: 0 0 5px 0;">Your Referral Link:</p>
        <a href="${shareUrl}" style="color: #666; text-decoration: none; font-family: monospace; font-size: 14px; word-break: break-all;">
          ${shareUrl}
        </a>
      </div>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `You're in! 🎟️ Save your visit to ${data.merchantName} inside`,
    html,
    attachments: [
      {
        filename: 'invite.ics',
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
