'use client';

import Script from 'next/script';

interface MicrosoftClarityProps {
  projectId?: string;
}

/**
 * Microsoft Clarity 会话录制组件
 *
 * 设置步骤:
 * 1. 访问 https://clarity.microsoft.com/
 * 2. 创建项目并获取 Project ID
 * 3. 设置环境变量 NEXT_PUBLIC_CLARITY_PROJECT_ID
 *
 * 功能:
 * - 用户会话录制 (可回放用户操作)
 * - 热力图分析
 * - 点击追踪
 * - 表单分析
 */
export default function MicrosoftClarity({ projectId }: MicrosoftClarityProps) {
  const clarityId = projectId || process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  if (!clarityId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`,
      }}
    />
  );
}
