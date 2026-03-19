'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
    getMerchantSmsRecipients,
    sendMerchantSmsAction,
    getMerchantSmsLogs,
    type SmsRecipient,
    type SmsSendResult,
    type SmsLog,
} from '@/actions/merchant-sms'

const MAX_SMS_LENGTH = 160

// ─────────────────────── SMS Content Linter ───────────────────────
interface LintIssue {
    level: 'danger' | 'warning' | 'tip'
    word: string
    reason: string
}

const SMS_RULES: { pattern: RegExp; level: LintIssue['level']; reason: string }[] = [
    { pattern: /\bfree\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会导致短信屏蔽' },
    { pattern: /\bwin\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词（获奖类），会导致屏蔽' },
    { pattern: /\bwinner\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会导致屏蔽' },
    { pattern: /\bprice\b/gi, level: 'warning', reason: '中风险垃圾词，可能被过滤' },
    { pattern: /\bcash\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会导致屏蔽' },
    { pattern: /\bcongratulations\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词（中奖类），会导致屏蔽' },
    { pattern: /\byou.ve been selected\b/gi, level: 'danger', reason: '典型诈骗短信词语，会导致屏蔽' },
    { pattern: /bit\.ly|tinyurl\.com|goo\.gl/gi, level: 'danger', reason: '短链接会导致屏蔽，建议用完整 URL（如 https://updeal.com/...）' },
    { pattern: /[A-Z]{6,}/g, level: 'warning', reason: '连续大写字母（≥6个）会被运营商标记为垃圾短信' },
    { pattern: /!!!+/g, level: 'warning', reason: '连续感叹号会增加屏蔽风险' },
    { pattern: /！！！+/g, level: 'warning', reason: '连续感叹号会增加屏蔽风险' },
    { pattern: /\d{10,}/g, level: 'warning', reason: '长串数字（像电话号码）会增加被运营商过滤的风险' },
]

const SMS_TIP_MISSING_STOP = {
    level: 'tip' as const,
    word: 'STOP 退订提示',
    reason: '建议在短信末尾加上“回复 STOP 可退订”，部分运营商要求合规短信必须包含这个提示，缺少会屏蔽。',
}

function lintSms(body: string): LintIssue[] {
    const issues: LintIssue[] = []
    for (const rule of SMS_RULES) {
        rule.pattern.lastIndex = 0
        const match = rule.pattern.exec(body)
        if (match) {
            issues.push({ level: rule.level, word: match[0], reason: rule.reason })
        }
    }
    // Suggest STOP opt-out if not present
    if (!/stop|退订|unsubscribe/i.test(body)) {
        issues.push(SMS_TIP_MISSING_STOP)
    }
    return issues
}

// ─────────────────────── Step Indicator ───────────────────────
function StepBadge({ step, current }: { step: number; current: number }) {
    const done = current > step
    const active = current === step
    return (
        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold border-2 transition-all ${done ? 'bg-emerald-500 border-emerald-500 text-white' :
            active ? 'bg-green-600 border-green-600 text-white' :
                'bg-white border-gray-200 text-gray-400'
            }`}>
            {done ? '✓' : step}
        </div>
    )
}

function StepBar({ current }: { current: number }) {
    const steps = ['选择收件人', '编写短信', '确认 & 发送']
    return (
        <div className="flex items-center gap-0 mb-8">
            {steps.map((label, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                        <StepBadge step={i + 1} current={current} />
                        <span className={`text-xs mt-1 font-medium whitespace-nowrap ${current === i + 1 ? 'text-green-600' : 'text-gray-400'}`}>
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
export default function MerchantSmsPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)

    // Step 1 state
    const [recipients, setRecipients] = useState<SmsRecipient[]>([])
    const [selected, setSelected] = useState<Set<string>>(new Set())
    const [loadingRecipients, setLoadingRecipients] = useState(true)
    const [recipientsError, setRecipientsError] = useState('')
    const [merchantName, setMerchantName] = useState('')
    const [searchTerm, setSearchTerm] = useState('')

    // Step 2 state
    const [message, setMessage] = useState('')
    const [lintIssues, setLintIssues] = useState<LintIssue[] | null>(null)
    const [lintChecked, setLintChecked] = useState(false)

    const handleLint = () => {
        const issues = lintSms(message)
        setLintIssues(issues)
        setLintChecked(true)
    }
    const handleMessageChange = (v: string) => { setMessage(v); setLintChecked(false); setLintIssues(null) }

    // Step 3 state
    const [sending, setSending] = useState(false)
    const [sendResults, setSendResults] = useState<SmsSendResult[] | null>(null)
    const [sendError, setSendError] = useState('')

    // Schedule state
    const [sendMode, setSendMode] = useState<'now' | 'schedule'>('now')
    const [scheduleTime, setScheduleTime] = useState('')
    const [scheduling, setScheduling] = useState(false)
    const [scheduleSuccess, setScheduleSuccess] = useState('')
    const [scheduleError, setScheduleError] = useState('')
    const [merchantId, setMerchantId] = useState('')
    const [merchantSlug, setMerchantSlug] = useState('')
    const [merchantTimezone, setMerchantTimezone] = useState('America/New_York')

    // SMS logs state
    const [logs, setLogs] = useState<SmsLog[]>([])
    const [logsLoading, setLogsLoading] = useState(false)
    const [showLogs, setShowLogs] = useState(false)
    const [logsStats, setLogsStats] = useState<{ total: number; success: number; failed: number } | null>(null)

    // ── Load recipients + merchant info
    useEffect(() => {
        getMerchantSmsRecipients().then(res => {
            if (!res.success) {
                setRecipientsError(res.error || '加载失败')
                if (res.error?.includes('未登录')) router.push('/merchant/login')
            } else {
                setRecipients(res.recipients || [])
                setMerchantName(res.merchantName || '')
                if (res.merchantId) setMerchantId(res.merchantId)
            }
            setLoadingRecipients(false)
        })
        // Fetch merchant slug + timezone from session
        fetch('/api/store/merchant-info').then(r => r.json()).then(d => {
            if (d.slug) setMerchantSlug(d.slug)
            if (d.timezone) setMerchantTimezone(d.timezone)
        }).catch(() => { })
    }, [])

    // ── Load SMS logs
    const loadLogs = useCallback(async () => {
        setLogsLoading(true)
        const res = await getMerchantSmsLogs()
        if (res.success) {
            setLogs(res.logs || [])
            setLogsStats(res.stats || null)
        }
        setLogsLoading(false)
    }, [])

    useEffect(() => {
        loadLogs()
    }, [loadLogs])

    // ── Filtered list
    const filtered = recipients.filter(r =>
        !searchTerm ||
        r.phone.includes(searchTerm) ||
        (r.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.couponCode.toLowerCase().includes(searchTerm.toLowerCase())
    )
    const allFilteredSelected = filtered.length > 0 && filtered.every(r => selected.has(r.phone))

    const toggleAll = () => {
        if (allFilteredSelected) {
            setSelected(prev => {
                const next = new Set(prev)
                filtered.forEach(r => next.delete(r.phone))
                return next
            })
        } else {
            setSelected(prev => {
                const next = new Set(prev)
                filtered.forEach(r => next.add(r.phone))
                return next
            })
        }
    }

    const toggleOne = (phone: string) => {
        setSelected(prev => {
            const next = new Set(prev)
            next.has(phone) ? next.delete(phone) : next.add(phone)
            return next
        })
    }

    // ── Send now
    const handleSend = async () => {
        setSending(true)
        setSendError('')
        const selectedRecipients = recipients
            .filter(r => selected.has(r.phone))
            .map(r => ({ phone: r.phone, name: r.name }))
        const res = await sendMerchantSmsAction({ recipients: selectedRecipients, message })
        setSending(false)
        if (res.success) {
            setSendResults(res.results || [])
            loadLogs()
        } else {
            setSendError(res.error || '发送失败')
        }
    }

    // ── Schedule send (with pre-flight validation)
    const handleSchedule = async () => {
        if (!scheduleTime) { setScheduleError('请选择发送时间'); return }
        setScheduling(true)
        setScheduleError('')
        setScheduleSuccess('')

        const selectedRecipients = recipients
            .filter(r => selected.has(r.phone))
            .map(r => ({ phone: r.phone, name: r.name }))

        try {
            const res = await fetch('/api/store/schedule-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    merchantSlug,
                    merchantId,
                    type: 'sms',
                    recipients: selectedRecipients,
                    body: message,
                    scheduledLocalTime: scheduleTime,
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.success) {
                setScheduleError(data.error || '定时设置失败')
            } else {
                // Format the scheduled time in the store's timezone
                const formatted = new Date(data.scheduledAt).toLocaleString('zh-CN', {
                    timeZone: data.timezone || merchantTimezone,
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', hour12: false,
                })
                setScheduleSuccess(`✅ 短信已定时！将于门店时间 ${formatted} 自动发送给 ${selectedRecipients.length} 位客户。`)
            }
        } catch (e: any) {
            setScheduleError(e.message || '网络错误，请重试')
        } finally {
            setScheduling(false)
        }
    }

    // ─────────────── RENDER ───────────────

    if (loadingRecipients) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto" />
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
                        <h1 className="text-xl font-bold text-gray-900">发送短信</h1>
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
                                    共 {recipients.length} 位留有手机号的客户，已选 <span className="font-bold text-green-600">{selected.size}</span> 人
                                </p>
                            </div>
                            {recipients.length === 0 && (
                                <span className="text-xs bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full font-medium">暂无留手机号的客户</span>
                            )}
                        </div>

                        {/* Search */}
                        <div className="mb-4">
                            <input
                                type="text"
                                placeholder="搜索姓名、手机号或券码..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                                    className="w-4 h-4 rounded accent-green-600 cursor-pointer"
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
                                    {searchTerm ? '没有匹配的结果' : '暂无留有手机号的客户'}
                                </div>
                            ) : (
                                filtered.map(r => (
                                    <label
                                        key={r.phone}
                                        className={`flex items-center gap-4 px-4 py-3 rounded-xl border cursor-pointer transition-all ${selected.has(r.phone)
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                            }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selected.has(r.phone)}
                                            onChange={() => toggleOne(r.phone)}
                                            className="w-4 h-4 rounded accent-green-600 flex-shrink-0"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-sm text-gray-900 truncate">
                                                    {r.name || '（无姓名）'}
                                                </span>
                                                <StatusBadge status={r.couponStatus} />
                                            </div>
                                            <div className="text-xs text-gray-400 mt-0.5 font-mono">{r.phone}</div>
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
                                className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                下一步：编写短信 <span>→</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* ──────── STEP 2: Compose ──────── */}
                {step === 2 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">编写短信</h2>
                        <p className="text-sm text-gray-500 mb-6">将发送给 <span className="font-bold text-green-600">{selected.size}</span> 位客户</p>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                短信内容 <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={message}
                                onChange={e => handleMessageChange(e.target.value)}
                                placeholder={`您好！感谢您领取 ${merchantName} 的优惠券，欢迎到店使用。期待您的光临！回复 STOP 可退订。`}
                                rows={5}
                                maxLength={500}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none leading-relaxed"
                            />
                            <div className="flex items-center justify-between text-xs mt-1">
                                <span className="text-gray-400">建议控制在 {MAX_SMS_LENGTH} 字符以内，超出将按多条短信计费</span>
                                <span className={`font-mono font-bold ${message.length > MAX_SMS_LENGTH ? 'text-amber-500' : 'text-gray-400'}`}>
                                    {message.length} / {MAX_SMS_LENGTH}
                                </span>
                            </div>
                        </div>

                        {/* ── Content Lint Panel ── */}
                        <div className="mt-4">
                            <button
                                onClick={handleLint}
                                disabled={!message.trim()}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold rounded-xl hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                🔍 检查短信内容
                            </button>

                            {lintChecked && lintIssues !== null && (
                                <div className={`mt-3 rounded-xl border p-4 ${lintIssues.every(i => i.level === 'tip')
                                        ? 'bg-blue-50 border-blue-200'
                                        : lintIssues.some(i => i.level === 'danger')
                                            ? 'bg-red-50 border-red-200'
                                            : lintIssues.some(i => i.level === 'warning')
                                                ? 'bg-amber-50 border-amber-200'
                                                : 'bg-green-50 border-green-200'
                                    }`}>
                                    {lintIssues.filter(i => i.level !== 'tip').length === 0 && !lintIssues.some(i => i.level === 'danger') ? (
                                        <>
                                            <div className="flex items-center gap-2 text-green-700 font-semibold text-sm mb-2">
                                                ✅ 内容检查通过！未发现屏蔽词汇。
                                            </div>
                                            {lintIssues.filter(i => i.level === 'tip').map((issue, i) => (
                                                <div key={i} className="flex gap-3 text-sm p-3 rounded-lg bg-blue-100 mt-2">
                                                    <span className="flex-shrink-0">💡</span>
                                                    <div>
                                                        <div className="font-semibold text-blue-800">{issue.word}</div>
                                                        <div className="text-xs text-blue-700 mt-0.5">{issue.reason}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    ) : (
                                        <>
                                            <div className="text-sm font-bold text-gray-800 mb-3">
                                                发现 {lintIssues.filter(i => i.level !== 'tip').length} 个问题，建议修改后再发送：
                                            </div>
                                            <div className="space-y-2">
                                                {lintIssues.map((issue, i) => (
                                                    <div key={i} className={`flex gap-3 text-sm p-3 rounded-lg ${issue.level === 'danger' ? 'bg-red-100' :
                                                            issue.level === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
                                                        }`}>
                                                        <span className="flex-shrink-0 mt-0.5">
                                                            {issue.level === 'danger' ? '🚫' : issue.level === 'warning' ? '⚠️' : '💡'}
                                                        </span>
                                                        <div>
                                                            <div className="font-semibold text-gray-800">
                                                                <span className={`px-1.5 py-0.5 rounded font-mono text-xs mr-1 ${issue.level === 'danger' ? 'bg-red-200 text-red-800' :
                                                                        issue.level === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'
                                                                    }`}>{issue.word}</span>
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
                                disabled={!message.trim()}
                                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                下一步：确认发送 →
                            </button>
                        </div>
                    </div>
                )}

                {/* ──────── STEP 3: Confirm & Send ──────── */}
                {step === 3 && (
                    <div className="bg-white rounded-2xl shadow p-6">
                        {!sendResults && !scheduleSuccess ? (
                            <>
                                <h2 className="text-lg font-bold text-gray-900 mb-1">确认发送</h2>
                                <p className="text-sm text-gray-500 mb-6">请核对以下信息，确认无误后选择发送方式</p>

                                {/* Summary */}
                                <div className="space-y-4 mb-6">
                                    <div className="flex gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                                        <span className="text-green-500 text-lg">👥</span>
                                        <div>
                                            <div className="text-xs font-semibold text-green-600 uppercase tracking-wide">收件人</div>
                                            <div className="text-sm font-bold text-gray-900 mt-0.5">{selected.size} 位客户</div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">短信内容预览</div>
                                        <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{message}</div>
                                        <div className="text-xs text-gray-400 mt-2">{message.length} 字符{message.length > MAX_SMS_LENGTH ? `（超出 ${message.length - MAX_SMS_LENGTH} 字符，将按多条计费）` : ''}</div>
                                    </div>
                                </div>

                                {/* Recipient list preview */}
                                <div className="mb-6">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">收件人列表</div>
                                    <div className="max-h-40 overflow-y-auto space-y-1">
                                        {recipients
                                            .filter(r => selected.has(r.phone))
                                            .map(r => (
                                                <div key={r.phone} className="flex items-center gap-2 text-sm px-3 py-1.5 bg-gray-50 rounded-lg">
                                                    <span className="text-gray-400">•</span>
                                                    <span className="font-medium text-gray-700">{r.name || '—'}</span>
                                                    <span className="text-gray-400 text-xs font-mono">{r.phone}</span>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* ── Send mode toggle ── */}
                                <div className="mb-5">
                                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">发送方式</div>
                                    <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                                        <button
                                            onClick={() => { setSendMode('now'); setScheduleError(''); setScheduleSuccess('') }}
                                            className={`flex-1 py-2.5 text-sm font-semibold transition ${sendMode === 'now'
                                                ? 'bg-emerald-600 text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            ⚡ 立即发送
                                        </button>
                                        <button
                                            onClick={() => { setSendMode('schedule'); setSendError(''); }}
                                            className={`flex-1 py-2.5 text-sm font-semibold transition ${sendMode === 'schedule'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-white text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            🕐 定时发送
                                        </button>
                                    </div>
                                </div>

                                {/* ── Schedule time picker ── */}
                                {sendMode === 'schedule' && (
                                    <div className="mb-5 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <label className="block text-sm font-semibold text-blue-800 mb-2">
                                            选择发送时间
                                            <span className="ml-1 font-normal text-blue-500 text-xs">（以门店所在时区 {merchantTimezone} 为准）</span>
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={scheduleTime}
                                            onChange={e => { setScheduleTime(e.target.value); setScheduleError(''); setScheduleSuccess('') }}
                                            className="w-full px-3 py-2.5 border border-blue-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        />
                                        <p className="mt-2 text-xs text-blue-500">
                                            💡 点击「定时发送」后系统会立即检查短信能否正常发出，验证通过后才会保存定时任务。
                                        </p>
                                    </div>
                                )}

                                {/* Errors / success */}
                                {sendError && (
                                    <div className="mb-4 p-4 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100">
                                        ❌ {sendError}
                                    </div>
                                )}
                                {scheduleError && (
                                    <div className="mb-4 p-4 bg-red-50 text-red-700 text-sm rounded-xl border border-red-200 leading-relaxed">
                                        {scheduleError}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(2)} disabled={sending || scheduling} className="px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition disabled:opacity-50">
                                        ← 修改内容
                                    </button>
                                    {sendMode === 'now' ? (
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
                                            ) : '💬 确认发送'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSchedule}
                                            disabled={scheduling || !scheduleTime}
                                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {scheduling ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    验证中，请稍候...
                                                </>
                                            ) : '🕐 确认定时发送'}
                                        </button>
                                    )}
                                </div>
                            </>
                        ) : scheduleSuccess ? (
                            /* ─── Schedule success ─── */
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">🕐</div>
                                    <h2 className="text-xl font-bold text-gray-900">定时任务已创建</h2>
                                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800 leading-relaxed text-left">
                                        {scheduleSuccess}
                                    </div>
                                    <p className="mt-3 text-xs text-gray-400">系统已预先验证短信可正常发出，到时间会自动执行。</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setScheduleSuccess('')
                                            setSendMode('now')
                                            setScheduleTime('')
                                            setStep(1)
                                            setSelected(new Set())
                                            setMessage('')
                                        }}
                                        className="flex-1 px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                                    >
                                        再安排一条
                                    </button>
                                    <button
                                        onClick={() => router.push('/merchant/dashboard')}
                                        className="flex-1 px-5 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition"
                                    >
                                        返回首页
                                    </button>
                                </div>
                            </>
                        ) : (
                            /* ─── Send results ─── */
                            <>
                                <div className="text-center mb-6">
                                    <div className="text-5xl mb-3">
                                        {sendResults!.every(r => r.status === 'success') ? '🎉' : '📊'}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">发送完成</h2>
                                    <div className="flex items-center justify-center gap-6 mt-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-emerald-600">{sendResults!.filter(r => r.status === 'success').length}</div>
                                            <div className="text-xs text-gray-400">成功</div>
                                        </div>
                                        <div className="w-px h-8 bg-gray-200" />
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-red-500">{sendResults!.filter(r => r.status === 'failed').length}</div>
                                            <div className="text-xs text-gray-400">失败</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                                    {sendResults!.map(r => (
                                        <div key={r.phone} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${r.status === 'success' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                                            <span>{r.status === 'success' ? '✅' : '❌'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900">{r.name || r.phone}</div>
                                                {r.status === 'failed' && r.error && (
                                                    <div className="text-xs text-red-500 truncate mt-0.5">{r.error}</div>
                                                )}
                                            </div>
                                            <span className="text-xs text-gray-400 flex-shrink-0 font-mono">{r.phone}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setSendResults(null)
                                            setStep(1)
                                            setSelected(new Set())
                                            setMessage('')
                                        }}
                                        className="flex-1 px-5 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition"
                                    >
                                        再发一条
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

                {/* ──────── SMS HISTORY ──────── */}
                <div className="mt-6 bg-white rounded-2xl shadow">
                    <button
                        onClick={() => setShowLogs(v => !v)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 rounded-2xl transition"
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📋</span>
                            <span className="font-bold text-gray-900">发送记录</span>
                            {logsStats && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
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
                                                <th className="pb-2 text-left text-xs font-bold text-gray-500 uppercase pl-4">短信内容</th>
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
                                                        <div className="text-xs text-gray-400 font-mono">{log.recipient_phone}</div>
                                                    </td>
                                                    <td className="py-2.5 pl-4 max-w-[200px]">
                                                        <div className="text-gray-700 truncate text-xs">{log.message}</div>
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
