'use client';

import { useState } from 'react';
import type { EmailLog } from '@/actions/email-logs';

interface Props {
    log: EmailLog;
}

export default function EmailPreviewModal({ log }: Props) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline underline-offset-2"
            >
                预览
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">{log.subject}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    发送至：<span className="font-mono">{log.recipient_email}</span>
                                    {log.recipient_name && ` (${log.recipient_name})`}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-xs text-gray-400">
                                        {new Date(log.sent_at).toLocaleString('zh-CN', { timeZone: 'America/New_York' })} (NY)
                                    </span>
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${log.status === 'success'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {log.status === 'success' ? '✅ 发送成功' : '❌ 发送失败'}
                                    </span>
                                </div>
                                {log.error_message && (
                                    <p className="text-xs text-red-600 mt-1 bg-red-50 px-2 py-1 rounded font-mono">
                                        错误：{log.error_message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                className="ml-4 text-gray-400 hover:text-gray-600 text-2xl leading-none font-light"
                            >
                                ×
                            </button>
                        </div>

                        {/* Email Preview */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-100">
                            {log.html_content ? (
                                <div className="bg-white rounded-xl overflow-hidden shadow">
                                    <iframe
                                        srcDoc={log.html_content}
                                        title="邮件预览"
                                        className="w-full"
                                        style={{ minHeight: '480px', border: 'none' }}
                                        sandbox="allow-same-origin"
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                                    未存储邮件内容
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
