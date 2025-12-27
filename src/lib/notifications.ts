/**
 * 实时通知系统 - 阿里云 SMTP 邮件备份
 *
 * 当新客户领取优惠券时发送邮件通知
 * 即使数据库写入失败，邮件备份可以帮助恢复数据
 *
 * 环境变量配置:
 * - ALIYUN_SMTP_HOST: smtpdm.aliyun.com
 * - ALIYUN_SMTP_PORT: 465
 * - ALIYUN_SMTP_USER: store@mail.wifimee.com
 * - ALIYUN_SMTP_PASS: SMTP密码
 * - ADMIN_BACKUP_EMAIL: 接收备份邮件的管理员邮箱
 */

import nodemailer from 'nodemailer';

interface ClaimNotificationData {
  merchantId: string;
  merchantName: string;
  phone: string;
  name: string;
  couponCode: string;
}

/**
 * 发送新客户领取通知（邮件备份）
 */
export async function sendClaimNotification(data: ClaimNotificationData): Promise<boolean> {
  const results = await Promise.allSettled([
    sendEmailBackup(data),
    sendSlackNotification(data),
  ]);

  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);
  return anySuccess;
}

/**
 * 通过阿里云 SMTP 发送邮件备份
 */
async function sendEmailBackup(data: ClaimNotificationData): Promise<boolean> {
  const smtpHost = process.env.ALIYUN_SMTP_HOST;
  const smtpPort = Number(process.env.ALIYUN_SMTP_PORT) || 465;
  const smtpUser = process.env.ALIYUN_SMTP_USER;
  const smtpPass = process.env.ALIYUN_SMTP_PASS;
  const adminEmail = process.env.ADMIN_BACKUP_EMAIL;

  if (!smtpHost || !smtpUser || !smtpPass || !adminEmail) {
    console.log('[Email Backup] Not configured, skipping. Missing:', {
      host: !smtpHost,
      user: !smtpUser,
      pass: !smtpPass,
      admin: !adminEmail
    });
    return false;
  }

  try {
    // 配置阿里云 SMTP
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true, // use SSL for port 465
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

    // 发送邮件
    await transporter.sendMail({
      from: `"UpDeal 系统" <${smtpUser}>`,
      to: adminEmail,
      subject: `[新客户] ${data.merchantName} - ${data.phone}`,
      text: `
新客户领券成功！
================
店铺: ${data.merchantName}
姓名: ${data.name || '-'}
电话: ${data.phone}
券码: ${data.couponCode}
时间: ${now}
================
*这是一封数据库备份邮件*
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <h2 style="color: #FF5722; border-bottom: 2px solid #FF5722; padding-bottom: 10px;">
            🎉 新客户领券成功！
          </h2>
          <table style="border-collapse: collapse; width: 100%;">
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9; width: 80px;">店铺</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${data.merchantName}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">姓名</td>
              <td style="padding: 12px; border: 1px solid #ddd;">${data.name || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">电话</td>
              <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace; font-size: 16px; color: #333;">
                <strong>${data.phone}</strong>
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">券码</td>
              <td style="padding: 12px; border: 1px solid #ddd; font-family: monospace; background: #FFF3E0; color: #E65100;">
                ${data.couponCode}
              </td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; font-weight: bold; background: #f9f9f9;">时间</td>
              <td style="padding: 12px; border: 1px solid #ddd; color: #666;">${now}</td>
            </tr>
          </table>
          <p style="color: #999; font-size: 12px; margin-top: 20px; text-align: center;">
            📧 这是一封数据库备份邮件，由 UpDeal 系统自动发送
          </p>
        </div>
      `,
    });

    console.log('[Email Backup] Sent successfully for:', data.couponCode);
    return true;
  } catch (error) {
    console.error('[Email Backup] Failed:', error);
    // 邮件发送失败不应阻止主流程
    return false;
  }
}

/**
 * 发送 Slack 通知（可选）
 */
async function sendSlackNotification(data: ClaimNotificationData): Promise<boolean> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎉 新客户领取优惠券',
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*商家:*\n${data.merchantName}`,
              },
              {
                type: 'mrkdwn',
                text: `*优惠码:*\n\`${data.couponCode}\``,
              },
              {
                type: 'mrkdwn',
                text: `*电话:*\n${data.phone}`,
              },
              {
                type: 'mrkdwn',
                text: `*姓名:*\n${data.name || '-'}`,
              },
            ],
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[Slack] Notification failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Slack] Notification error:', error);
    return false;
  }
}
