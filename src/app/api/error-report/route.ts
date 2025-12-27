import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ErrorReport {
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  url: string;
}

/**
 * 简化版错误报告 API
 *
 * 在没有 Sentry 的情况下，提供基本的错误追踪能力
 * 错误会被记录到服务器日志，并可选发送通知
 */
export async function POST(request: NextRequest) {
  try {
    const body: ErrorReport = await request.json();

    // 记录到服务器日志
    console.error('[CLIENT ERROR REPORT]', {
      timestamp: body.timestamp,
      url: body.url,
      message: body.message,
      stack: body.stack?.split('\n').slice(0, 5).join('\n'), // 只记录前5行堆栈
      metadata: body.metadata,
    });

    // 可选：发送到 Slack 或邮件
    const slackWebhook = process.env.ERROR_SLACK_WEBHOOK_URL;
    if (slackWebhook) {
      await fetch(slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blocks: [
            {
              type: 'header',
              text: {
                type: 'plain_text',
                text: '🚨 前端错误报告',
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*错误:* ${body.message}\n*页面:* ${body.url}\n*时间:* ${body.timestamp}`,
              },
            },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `\`\`\`${body.stack?.split('\n').slice(0, 3).join('\n') || 'No stack trace'}\`\`\``,
              },
            },
          ],
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing error report:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
