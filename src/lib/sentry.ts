/**
 * Sentry 错误监控配置
 *
 * 安装步骤:
 * 1. 运行: npx @sentry/wizard@latest -i nextjs
 * 2. 按照向导完成配置
 * 3. 设置环境变量:
 *    - SENTRY_DSN: 从 Sentry 项目设置获取
 *    - SENTRY_AUTH_TOKEN: 用于上传 source maps (可选)
 *
 * 或者手动安装:
 * 1. npm install @sentry/nextjs
 * 2. 创建 sentry.client.config.ts, sentry.server.config.ts
 * 3. 在 next.config.js 中添加 withSentryConfig
 *
 * Sentry 向导会自动完成这些步骤。
 */

// 这个文件提供手动错误报告的辅助函数
// 当 Sentry 安装后，可以使用这些函数

export function captureError(error: Error, context?: Record<string, any>) {
  // 如果 Sentry 已安装，使用 Sentry.captureException
  // 否则只记录到控制台
  console.error('[Error Captured]', error.message, context);

  // 检查 Sentry 是否可用
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureException(error, {
      extra: context,
    });
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  console.log(`[${level.toUpperCase()}]`, message);

  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(message, level);
  }
}

/**
 * 在没有完整 Sentry SDK 的情况下，使用简化版错误追踪
 * 通过 API 发送错误到后端
 */
export async function reportError(error: Error, metadata?: Record<string, any>) {
  try {
    await fetch('/api/error-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        metadata,
        timestamp: new Date().toISOString(),
        url: typeof window !== 'undefined' ? window.location.href : 'server',
      }),
    });
  } catch (e) {
    console.error('Failed to report error:', e);
  }
}
