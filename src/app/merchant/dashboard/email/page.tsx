'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    getMerchantEmailRecipients,
    sendMerchantEmailAction,
    type EmailRecipient,
    type SendResult,
} from '@/actions/merchant-email'
import { getEmailLogs, type EmailLog } from '@/actions/email-logs'

// ─────────────────────── Content Linter ───────────────────────
interface LintIssue {
    level: 'danger' | 'warning' | 'tip'
    field: string
    word: string
    reason: string
}

const EMAIL_RULES: { pattern: RegExp; level: LintIssue['level']; reason: string }[] = [
    { pattern: /\bfree\b/gi, level: 'danger', reason: '高风险垃圾词，会被阿里云邮件过滤器拦截' },
    { pattern: /\bact now\b/gi, level: 'danger', reason: '高风险垃圾词（紧迫感促销语），会被拦截' },
    { pattern: /\bfinal call\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\blimited time\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\burgent\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\blast chance\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\bwin\b/gi, level: 'danger', reason: '高风险垃圾词（获奖类），会被拦截' },
    { pattern: /\bprize\b/gi, level: 'danger', reason: '高风险垃圾词（奖品类），会被拦截' },
    { pattern: /\bcash\b/gi, level: 'danger', reason: '高风险垃圾词（现金类），会被拦截' },
    { pattern: /\bcongratulations\b/gi, level: 'danger', reason: '高风险垃圾词（中奖类通知），会被拦截' },
    { pattern: /\b100% free\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\bclick here\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /\bearn money\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
    { pattern: /!!!+/g, level: 'danger', reason: '连续多个感叹号会触发垃圾邮件过滤' },
    { pattern: /！！！+/g, level: 'danger', reason: '连续多个感叹号会触发垃圾邮件过滤' },
    { pattern: /\bdiscount\b/gi, level: 'warning', reason: '促销词（中风险），尽量用「优惠」代替' },
    { pattern: /\boffer\b/gi, level: 'warning', reason: '促销词（中风险），尽量用「特惠」代替' },
    { pattern: /\bdeal\b/gi, level: 'warning', reason: '促销词（中风险）' },
    { pattern: /\bsale\b/gi, level: 'warning', reason: '促销词（中风险），可能触发过滤' },
    { pattern: /[A-Z]{6,}/g, level: 'warning', reason: '连续大写字母（≥6个）会触发垃圾邮件过滤' },
    { pattern: /bit\.ly|tinyurl|goo\.gl/gi, level: 'warning', reason: '短链接容易被标记为垃圾邮件，建议用完整 URL' },
]

function lintEmail(subject: string, body: string): LintIssue[] {
    const issues: LintIssue[] = []
    const checkField = (text: string, fieldName: string) => {
        for (const rule of EMAIL_RULES) {
            rule.pattern.lastIndex = 0
            const match = rule.pattern.exec(text)
            if (match) {
                issues.push({ level: rule.level, field: fieldName, word: match[0], reason: rule.reason })
            }
        }
    }
    checkField(subject, '邮件主题')
    checkField(body, '邮件正文')
    return issues
}

// ─────────────────────── Step Indicator ───────────────────────
function StepBadge({ step, current }: { step: number; current: number }) {
    const done = current > step
    const active = current === step
    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500 text-white' :
            active ? 'bg-blue-600 border-blue-600 text-white' :
                'bg-white border-gray-200 text-gray-400'
            }`}>
            {done ? '✓' : step}
        </div>
    )
}

function StepBar({ current }: { current: number }) {
    const steps = ['选择收件人', '编写邮件', '确认 & 发送']
    return (
        <div className="flex items-center gap-0 mb-8">
            {steps.map((label, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                        <StepBadge step={i + 1} current={current} />
                        <span className={`text-xs mt-1 font-medium whitespace-nowrap ${current === i + 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                            {label}
                        </span>
                    </div>
                    {i < steps.length - 1 && (
                        <div className={`flex-1 h-0.5 mx-2 mb-4 rounded ${current > i + 1 ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

// ─────────────────────── Status Badge ───────────────────────
function StatusBadge({ status }: { status: string }) {
    if (status === 'redeemed') return <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full font-medium">已核销</span>
    return <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">未核销</span>
}

// ─────────────────────── Main Component ───────────────────────
export default function MerchantEmailPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)

    // Step 1 state
    const [recipients, setRecipients] = useState<EmailRecipient[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [loadingRecipients, setLoadingRecipients] = useState(true)
    const [recipientsError, setRecipientsError] = useState('')
    const [merchantName, setMerchantName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Step 2 state
    const [subject, setSubject] = useState('')
    const [bodyText, setBodyText] = useState('')
    const [lintIssues, setLintIssues] = useState<LintIssue[] | null>(null)
    const [lintChecked, setLintChecked] = useState(false)

    const handleLint = () => {
        const issues = lintEmail(subject, bodyText)
        setLintIssues(issues)
        setLintChecked(true)
    }

    // Clear lint when content changes
    const handleSubjectChange = (v: string) => { setSubject(v); setLintChecked(false); setLintIssues(null) }
    const handleBodyChange = (v: string) => { setBodyText(v); setLintChecked(false); setLintIssues(null) }

    // Step 3 state
    const [sending, setSending] = useState(false)
    const [sendResults, setSendResults] = useState<SendResult[] | null>(null)
    const [sendError, setSendError] = useState('')

    // Email logs state
    const [merchantId, setMerchantId] = useState('')
    const [logs, setLogs] = useState<EmailLog[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [showLogs, setShowLogs] = useState(false)
    const [logsStats, setLogsStats] = useState<{ total: number; success: number; failed: number } | null>(null)

    // ── Load recipients
    useEffect(() => {
        getMerchantEmailRecipients().then(res => {
            if (!res.success) {
                setRecipientsError(res.error || '加载失败')
                if (res.error?.includes('未登录')) router.push('/merchant/login')
            } else {
                setRecipients(res.recipients || [])
                setMerchantName(res.merchantName || '')
                setSubject(`来自 ${res.merchantName || '商家'} 的消息`)
                if (res.merchantId) setMerchantId(res.merchantId)
            }
            setLoadingRecipients(false)
        })
    }, [])

    // ── Load email logs
    const loadLogs = useCallback(async (id: string) => {
        setLogsLoading(true)
        const res = await getEmailLogs({ merchantId: id, limit: 100 })
        if (res.success) {
            setLogs(res.logs)
            setLogsStats(res.stats)
        }
        setLogsLoading(false)
    }, [])

    useEffect(() => {
        if (merchantId) loadLogs(merchantId)
    }, [merchantId, loadLogs])

    // ── Filtered list
    const filtered = recipients.filter(r =>
        !searchTerm ||
        r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.couponCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.email))

    const toggleAll = () => {
        if (allFilteredSelected) {
            setSelected(prev => {
                const next = new Set(prev)
                filtered.forEach(r => next.delete(r.email))
                return next
            })
        } else {
            setSelected(prev => {
                const next = new Set(prev)
                filtered.forEach(r => next.add(r.email))
                return next
            })
        }
    }

    const toggleOne = (email: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(email) ? next.delete(email) : next.add(email)
            return next
        })
    }

    // ── Send
    const handleSend = async () => {
        setSending(true)
        setSendError('')
        const selectedRecipients = recipients
            .filter(r => selected.has(r.email))
            .map(r => ({ email: r.email, name: r.name }))
        const res = await sendMerchantEmailAction({
            recipients: selectedRecipients,
            subject,
            bodyText,
        })
        setSending(false)
        if (res.success) {
            setSendResults(res.results || [])
            // Refresh logs after send
            if (merchantId) loadLogs(merchantId)
        } else {
            setSendError(res.error || '发送失败')
        }
    }

    // ─────────────── RENDER ───────────────

    if (loadingRecipients) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-3 text-gray-500 text-sm">加载客户列表...</p>
                </div>
            </div>
        )
    }

    if (recipientsError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm w-full">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="font-bold text-gray-900 mb-2">加载失败</h2>
                    <p className="text-gray-500 text-sm mb-6">{recipientsError}</p>
                    <button onClick={() => router.push('/merchant/dashboard')} className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition">返回首页</button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                    <button
                        onClick={() => router.push('/merchant/dashboard')}
                        className="text-gray-400 hover:text-gray-600 transition"
                    >
                        ← 返回
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">发送邮件</h1>
                        <p className="text-xs text-gray-400">{merchantName}</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <StepBar current={step} />

                {/* ──────── STEP 1: Select Recipients ──────── */}
                {step === 1 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">选择收件人</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    共 {recipients.length} 位留有邮箱的客户，已选 <span className="font-bold text-blue-600">{selected.size}</span> 人
                                </p>
                            </div>
                            {recipients.length === 0 && (
                                <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">暂无留邮箱的客户</span>
                            )}
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="搜索姓名、邮箱或券码..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Select All */}
                        {filtered.length > 0 && (
                            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl mb-3">
                                <input
                                    type="checkbox"
                                    id="selectAll"
                                    checked={allFilteredSelected}
                                    onChange={toggleAll}
                                    className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
                                />
                                <label htmlFor="selectAll" className="text-sm font-semibold text-gray-700 cursor-pointer flex-1">
                                    全选 / 取消全选（当前显示 {filtered.length} 人）
                                </label>
                            </div>
                        )}

                        {/* List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                            {filtered.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-sm">
                                    {searchTerm ? '没有匹配的结果' : '暂无留有邮箱的客户'}
                                </div>
                            ) : (
                                filtered.map(r => (
                                    <label
                                        key={r.email}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${selected.has(r.email)
                                            ? 'border-blue-300 bg-blue-50'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.has(r.email)}
                                            onChange={() => toggleOne(r.email)}
                                            className="w-4 h-4 rounded accent-blue-600 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-gray-900 truncate">
                                                    {r.name || '（无姓名）'}
                                                </span>
                                                <StatusBadge status={r.couponStatus} />
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 truncate">{r.email}</div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{r.couponCode}</div>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={() => setStep(2)}
                                disabled={selected.size === 0}
                                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                下一步：编写邮件 <span>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ──────── STEP 2: Compose ──────── */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">编写邮件</h2>
                        <p className="text-sm text-gray-500 mb-6">将发送给 <span className="font-bold text-blue-600">{selected.size}</span> 位客户</p>

                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    邮件主题 <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={e => handleSubjectChange(e.target.value)}
                                    placeholder="例如：我们有新优惠，欢迎回来！"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    邮件正文 <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={bodyText}
                                    onChange={e => handleBodyChange(e.target.value)}
                                    placeholder={`您好！\n\n感谢您一直以来的支持！我们的最新活动正在进行中...\n\n期待您的光临！\n${merchantName} 团队`}
                                    rows={10}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none leading-relaxed"
                                />
                                <p className="text-xs text-gray-400 mt-1.5">支持换行，系统会自动套用品牌模板样式发送</p>
                            </div>
                        </div>

                        {/* ── Content Lint Panel ── */}
                        <div className="mt-4">
                            <button
                                onClick={handleLint}
                                disabled={!subject.trim() && !bodyText.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                🔍 检查邮件内容
                            </button>

                            {lintChecked && lintIssues !== null && (
                                <div className={`mt-3 rounded-xl border p-4 ${lintIssues.length === 0
                                        ? 'bg-green-50 border-green-200'
                                        : lintIssues.some(i => i.level === 'danger')
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-amber-50 border-amber-200'
                                    }`}>
                                    {lintIssues.length === 0 ? (
                                        <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">
                                            ✅ 内容检查通过！未发现高风险词汇，可以安全发送。
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-sm font-bold text-gray-800 mb-3">
                                                发现 {lintIssues.length} 个问题，建议修改后再发送：
                                            </div>
                                            <div className="space-y-2">
                                                {lintIssues.map((issue, i) => (
                                                    <div key={i} className={`flex gap-3 text-sm p-3 rounded-lg ${issue.level === 'danger' ? 'bg-red-100' : 'bg-amber-100'
                                                        }`}>
                                                        <span className="flex-shrink-0 mt-0.5">
                                                            {issue.level === 'danger' ? '🚫' : '⚠️'}
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">
                                                                <span className={`px-1.5 py-0.5 rounded font-mono text-xs mr-1 ${issue.level === 'danger'
                                                                        ? 'bg-red-200 text-red-800'
                                                                        : 'bg-amber-200 text-amber-800'
                                                                    }`}>{issue.word}</span>
                                                                <span className="text-xs text-gray-500">在「{issue.field}」中</span>
                                                            </div>
                                                            <div className="text-xs text-gray-600 mt-0.5">{issue.reason}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button onClick={() => setStep(1)} className="px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition">
                                ← 返回
                            </button>
                            <button
                                onClick={() => setStep(3)}
                                disabled={!subject.trim() || !bodyText.trim()}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                下一步：确认发送 →
                            </button>
                        </div>
                    </div>
                )}

                {/* ──────── STEP 3: Confirm & Send ──────── */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        {!sendResults ? (
                            <>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">确认发送</h2>
                                <p className="text-sm text-gray-500 mb-6">请核对以下信息，确认无误后点击发送</p>

                                {/* Summary */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <span className="text-blue-500 text-lg">👥</span>
                                        <div>
                                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">收件人</div>
                                            <div className="text-sm font-bold text-gray-900 mt-0.5">{selected.size} 位客户</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <span className="text-gray-400 text-lg">✉️</span>
                                        <div className="min-w-0">
                                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">主题</div>
                                            <div className="text-sm font-bold text-gray-900 mt-0.5 truncate">{subject}</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">正文预览</div>
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-5 leading-relaxed">{bodyText}</div>
                                    </div>
                                </div>

                                {/* Recipient list preview */}
                                <div className="mb-6">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">收件人列表</div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {recipients
                                            .filter(r => selected.has(r.email))
                                            .map(r => (
                                                <div key={r.email} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-400">•</span>
                                                    <span className="font-medium text-gray-700">{r.name || '—'}</span>
                                                    <span className="text-gray-400 text-xs">{r.email}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {sendError && (
                                    <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                        ❌ {sendError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} disabled={sending} className="px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
                                        ← 修改内容
                                    </button>
                                    <button
                                        onClick={handleSend}
                                        disabled={sending}
                                        className="flex-1 px-6 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {sending ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                发送中，请稍候...
                                            </>
                                        ) : '✉️ 确认发送'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ─── Results ─── */
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">
                                        {sendResults.every(r => r.status === 'success') ? '🎉' : '📊'}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">发送完成</h2>
                                    <div className="flex items-center justify-center gap-6 mt-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-emerald-600">{sendResults.filter(r => r.status === 'success').length}</div>
                                            <div className="text-xs text-gray-400">成功</div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200" />
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-red-500">{sendResults.filter(r => r.status === 'failed').length}</div>
                                            <div className="text-xs text-gray-400">失败</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                                    {sendResults.map(r => (
                                        <div key={r.email} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${r.status === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <span>{r.status === 'success' ? '✅' : '❌'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{r.name || r.email}</div>
                                                {r.status === 'failed' && r.error && (
                                                    <div className="text-xs text-red-500 truncate mt-0.5">{r.error}</div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 flex-shrink-0">{r.email}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSendResults(null)
                                            setStep(1)
                                            setSelected(new Set())
                                            setBodyText('')
                                        }}
                                        className="flex-1 px-5 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition"
                                    >
                                        再发一封
                                    </button>
                                    <button
                                        onClick={() => router.push('/merchant/dashboard')}
                                        className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                                    >
                                        返回首页
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
                {/* ──────── EMAIL HISTORY ──────── */}
                <div className="mt-6 bg-white rounded-2xl shadow">
                    <button
                        onClick={() => setShowLogs(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📋</span>
                            <span className="font-bold text-gray-900">发送记录</span>
                            {logsStats && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                    共 {logsStats.total} 条 · 成功率 {logsStats.total > 0 ? ((logsStats.success / logsStats.total) * 100).toFixed(0) : 0}%
                                </span>
                            )}
                        </div>
                        <span className="text-gray-400 text-sm">{showLogs ? '收起 ▲' : '展开 ▼'}</span>
                    </button>

                    {showLogs && (
                        <div className="px-6 pb-6">
                            {logsLoading ? (
                                <div className="text-center py-8 text-gray-400 text-sm">加载中...</div>
                            ) : logs.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">暂无发送记录</div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="pb-2 text-left text-xs font-bold text-gray-500 uppercase">时间</th>
                                                <th className="pb-2 text-left text-xs font-bold text-gray-500 uppercase pl-4">收件人</th>
                                                <th className="pb-2 text-left text-xs font-bold text-gray-500 uppercase pl-4">主题</th>
                                                <th className="pb-2 text-left text-xs font-bold text-gray-500 uppercase pl-4">状态</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {logs.map(log => (
                                                <tr key={log.id} className="hover:bg-gray-50">
                                                    <td className="py-2.5 text-xs text-gray-400 whitespace-nowrap">
                                                        {new Date(log.sent_at).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-2.5 pl-4">
                                                        <div className="font-medium text-gray-800">{log.recipient_name || '—'}</div>
                                                        <div className="text-xs text-gray-400">{log.recipient_email}</div>
                                                    </td>
                                                    <td className="py-2.5 pl-4 max-w-[200px]">
                                                        <div className="text-gray-700 truncate">{log.subject}</div>
                                                    </td>
                                                    <td className="py-2.5 pl-4 whitespace-nowrap">
                                                        {log.status === 'success'
                                                            ? <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">✅ 成功</span>
                                                            : <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-medium">❌ 失败</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
