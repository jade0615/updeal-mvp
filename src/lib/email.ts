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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Reservation Reminder</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your reservation at <strong>${data.merchantName}</strong> is tomorrow.
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you arrive.
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated reminder for your upcoming reservation.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `Reminder: ${data.merchantName} reservation tomorrow`,
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
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333; font-size: 22px; margin-bottom: 20px;">Reservation Follow-up</h2>
      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        We noticed you were unable to make your reservation at <strong>${data.merchantName}</strong>.
      </p>

      <p style="color: #555; font-size: 16px; line-height: 1.5;">
        Your confirmation code is still valid and can be used anytime this week.
      </p>

      <div style="background: #f8f9fa; border-left: 4px solid #4285f4; padding: 16px; margin: 24px 0;">
        <p style="margin: 0 0 8px 0; color: #666; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Confirmation Code</p>
        <p style="margin: 0; color: #333; font-size: 20px; font-weight: 600; letter-spacing: 1px;">${data.couponCode}</p>
      </div>

      <p style="color: #555; font-size: 14px; line-height: 1.5;">
        Please present this code when you visit.
      </p>

      <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;" />

      <p style="color: #888; font-size: 12px; line-height: 1.5;">
        This is an automated message regarding your reservation.
      </p>
    </div>
  `;

  return sendEmail({
    to: data.email,
    subject: `${data.merchantName} - Reservation still valid`,
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
