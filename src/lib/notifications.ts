/**
 * 实时通知系统
 *
 * 当新客户领取优惠券时发送通知
 * 支持多种通知渠道:
 * - Email (使用 Resend API)
 * - Slack Webhook
 * - 自定义 Webhook
 *
 * 环境变量配置:
 * - RESEND_API_KEY: Resend API 密钥
 * - NOTIFICATION_EMAIL: 接收通知的邮箱地址
 * - SLACK_WEBHOOK_URL: Slack 通知 Webhook (可选)
 */

interface ClaimNotificationData {
  merchantId: string;
  merchantName: string;
  phone: string;
  name: string;
  couponCode: string;
}

/**
 * 发送新客户领取通知
 */
export async function sendClaimNotification(data: ClaimNotificationData): Promise<boolean> {
  const results = await Promise.allSettled([
    sendEmailNotification(data),
    sendSlackNotification(data),
  ]);

  const anySuccess = results.some(r => r.status === 'fulfilled' && r.value === true);
  return anySuccess;
}

/**
 * 通过 Resend 发送邮件通知
 */
async function sendEmailNotification(data: ClaimNotificationData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.NOTIFICATION_EMAIL;

  if (!apiKey || !toEmail) {
    console.log('Email notification not configured, skipping');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'UpDeal <notifications@updeal.app>',
        to: [toEmail],
        subject: `[新客户] ${data.merchantName} - ${data.phone}`,
        html: `
          <h2>新客户领取优惠券</h2>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">商家</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.merchantName}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">电话</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">姓名</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${data.name || '-'}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">优惠码</td>
              <td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${data.couponCode}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold;">时间</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</td>
            </tr>
          </table>
          <p style="color: #666; font-size: 12px; margin-top: 16px;">
            此邮件由 UpDeal 系统自动发送
          </p>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Email notification failed:', response.status, await response.text());
      return false;
    }

    console.log('Email notification sent for:', data.couponCode);
    return true;
  } catch (error) {
    console.error('Email notification error:', error);
    return false;
  }
}

/**
 * 发送 Slack 通知
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
      console.error('Slack notification failed:', response.status);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Slack notification error:', error);
    return false;
  }
}
