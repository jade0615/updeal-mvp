'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatToNYTime, getNYLastUpdatedMessage } from '@/lib/utils/date'

// ─────────────────────── Content Lint Helpers ───────────────────────
interface LintIssue { level: 'danger' | 'warning' | 'tip'; field?: string; word: string; reason: string }

const EMAIL_LINT_RULES: { pattern: RegExp; level: 'danger' | 'warning'; reason: string }[] = [
  { pattern: /\bfree\b/gi, level: 'danger', reason: '高风险垃圾词，会被邮件服务拦截' },
  { pattern: /\bact now\b/gi, level: 'danger', reason: '高风险垃圾词（紧迫感促销），会被拦截' },
  { pattern: /\bfinal call\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\blimited time\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\burgent\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\blast chance\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\bwin\b/gi, level: 'danger', reason: '高风险垃圾词（获奖类），会被拦截' },
  { pattern: /\bprize\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\bcash\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /\bcongratulations\b/gi, level: 'danger', reason: '高风险垃圾词（中奖类），会被拦截' },
  { pattern: /\bclick here\b/gi, level: 'danger', reason: '高风险垃圾词，会被拦截' },
  { pattern: /!!!+/g, level: 'danger', reason: '连续感叹号会触发垃圾邮件过滤' },
  { pattern: /！！！+/g, level: 'danger', reason: '连续感叹号会触发垃圾邮件过滤' },
  { pattern: /\bdiscount\b/gi, level: 'warning', reason: '促销词（中风险），尽量用「优惠」代替' },
  { pattern: /\boffer\b/gi, level: 'warning', reason: '促销词（中风险），尽量用「特惠」代替' },
  { pattern: /\bsale\b/gi, level: 'warning', reason: '促销词（中风险），可能触发过滤' },
  { pattern: /[A-Z]{6,}/g, level: 'warning', reason: '连续大写字母（≥6个）会触发垃圾邮件过滤' },
  { pattern: /bit\.ly|tinyurl|goo\.gl/gi, level: 'warning', reason: '短链接容易被标记为垃圾邮件' },
]
function lintEmail(subject: string, body: string): LintIssue[] {
  const issues: LintIssue[] = []
  const check = (text: string, fieldName: string) => {
    for (const r of EMAIL_LINT_RULES) { r.pattern.lastIndex = 0; const m = r.pattern.exec(text); if (m) issues.push({ level: r.level, field: fieldName, word: m[0], reason: r.reason }) }
  }
  check(subject, '邮件主题'); check(body, '邮件正文')
  return issues
}

const SMS_LINT_RULES: { pattern: RegExp; level: 'danger' | 'warning'; reason: string }[] = [
  { pattern: /\bfree\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会屏蔽短信' },
  { pattern: /\bwin\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会屏蔽短信' },
  { pattern: /\bwinner\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会屏蔽短信' },
  { pattern: /\bcash\b/gi, level: 'danger', reason: '运营商垃圾过滤高风险词，会屏蔽短信' },
  { pattern: /\bcongratulations\b/gi, level: 'danger', reason: '典型诈骗短信词，会屏蔽短信' },
  { pattern: /bit\.ly|tinyurl\.com|goo\.gl/gi, level: 'danger', reason: '短链接会导致屏蔽，建议用完整 URL' },
  { pattern: /[A-Z]{6,}/g, level: 'warning', reason: '连续大写字母（≥6个）会被运营商标记为垃圾短信' },
  { pattern: /!!!+/g, level: 'warning', reason: '连续感叹号会增加屏蔽风险' },
  { pattern: /！！！+/g, level: 'warning', reason: '连续感叹号会增加屏蔽风险' },
  { pattern: /\d{10,}/g, level: 'warning', reason: '长串数字（像电话号码）会增加被运营商过滤的风险' },
  { pattern: /\bprice\b/gi, level: 'warning', reason: '中风险垃圾词，可能被过滤' },
]
function lintSmsContent(body: string): LintIssue[] {
  const issues: LintIssue[] = []
  for (const r of SMS_LINT_RULES) { r.pattern.lastIndex = 0; const m = r.pattern.exec(body); if (m) issues.push({ level: r.level, word: m[0], reason: r.reason }) }
  if (!/stop|退订|unsubscribe/i.test(body)) issues.push({ level: 'tip', word: 'STOP 退订提示', reason: '建议在短信末尾加「回复 STOP 可退订」，缺少会屏蔽。' })
  return issues
}

function LintPanel({ issues }: { issues: LintIssue[] }) {
  const errors = issues.filter(i => i.level !== 'tip')
  const tips = issues.filter(i => i.level === 'tip')
  const hasDanger = issues.some(i => i.level === 'danger')
  const bg = errors.length === 0 ? 'bg-green-50 border-green-200' : hasDanger ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'
  return (
    <div className={`mt-3 rounded-xl border p-3 ${bg}`}>
      {errors.length === 0 ? (
        <>
          <div className="flex items-center gap-2 text-green-700 font-semibold text-sm">✅ 内容检查通过！</div>
          {tips.map((t, i) => (
            <div key={i} className="flex gap-2 text-xs p-2 rounded-lg bg-blue-100 mt-2">
              <span>💡</span>
              <div><span className="font-semibold text-blue-800">{t.word}</span><div className="text-blue-700 mt-0.5">{t.reason}</div></div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div className="text-sm font-bold text-gray-800 mb-2">发现 {errors.length} 个问题，建议修改：</div>
          <div className="space-y-1.5">
            {issues.map((issue, i) => (
              <div key={i} className={`flex gap-2 text-xs p-2 rounded-lg ${issue.level === 'danger' ? 'bg-red-100' : issue.level === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                <span className="flex-shrink-0">{issue.level === 'danger' ? '🚫' : issue.level === 'warning' ? '⚠️' : '💡'}</span>
                <div>
                  <span className={`px-1 py-0.5 rounded font-mono text-xs mr-1 ${issue.level === 'danger' ? 'bg-red-200 text-red-800' : issue.level === 'warning' ? 'bg-amber-200 text-amber-800' : 'bg-blue-200 text-blue-800'}`}>{issue.word}</span>
                  {issue.field && <span className="text-gray-400 mr-1">在「{issue.field}」</span>}
                  <span className="text-gray-600">{issue.reason}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

interface RedeemResult {
  success: boolean
  message: string
  coupon?: {
    code: string
    merchant: string
    offer: string
    customer: string
    redeemedAt: string
  }
  error?: string
  errorCode?: string
}

interface RedeemHistoryItem {
  code: string
  time: string
  success: boolean
  couponName?: string // Newly added
}

interface MerchantPageProps {
  params: Promise<{ merchantSlug: string }>
}

export default function MerchantStoreRedeemPage({ params }: MerchantPageProps) {
  const { merchantSlug } = use(params)

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState('')
  const [pinLoading, setPinLoading] = useState(false)
  const [merchantName, setMerchantName] = useState('')
  const [merchantId, setMerchantId] = useState('')
  const [merchantTimezone, setMerchantTimezone] = useState('America/New_York')

  const [couponCode, setCouponCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RedeemResult | null>(null)

  // Verification State
  const [verifying, setVerifying] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [verificationData, setVerificationData] = useState<{
    code: string
    name: string
    customerName: string
    customerPhone: string
  } | null>(null)

  const [history, setHistory] = useState<RedeemHistoryItem[]>([])

  // Stats state
  const [stats, setStats] = useState<{
    todayRedemptions: number;
    totalRedemptions: number;
    totalClaims: number;
    totalViews: number;
    walletAdditions: number;
  } | null>(null)

  // Full History State
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [fullHistory, setFullHistory] = useState<any[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Claims List State
  const [claims, setClaims] = useState<any[]>([])
  const [claimsLoading, setClaimsLoading] = useState(false)

  // Email Panel State
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [emailSelected, setEmailSelected] = useState<Set<string>>(new Set())
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [emailSending, setEmailSending] = useState(false)
  const [emailResults, setEmailResults] = useState<{ email: string; name: string | null; status: string; error?: string }[] | null>(null)

  // Email Logs State
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [emailLogsLoading, setEmailLogsLoading] = useState(false)
  const [emailLogStats, setEmailLogStats] = useState<{ total: number; success: number } | null>(null)
  const [showEmailLogs, setShowEmailLogs] = useState(false)

  // SMS Panel State
  const [showSmsPanel, setShowSmsPanel] = useState(false)
  const [smsSelected, setSmsSelected] = useState<Set<string>>(new Set())
  const [smsMessage, setSmsMessage] = useState('')
  const [smsSending, setSmsSending] = useState(false)
  const [smsResults, setSmsResults] = useState<{ phone: string; name: string | null; status: string; error?: string }[] | null>(null)
  const [smsLogs, setSmsLogs] = useState<any[]>([])
  const [smsLogsLoading, setSmsLogsLoading] = useState(false)
  const [smsLogStats, setSmsLogStats] = useState<{ total: number; success: number } | null>(null)
  const [showSmsLogs, setShowSmsLogs] = useState(false)

  // Scheduled Send State (shared)
  const [emailScheduleMode, setEmailScheduleMode] = useState<'now' | 'later'>('now')
  const [emailScheduleTime, setEmailScheduleTime] = useState('')
  const [smsScheduleMode, setSmsScheduleMode] = useState<'now' | 'later'>('now')
  const [smsScheduleTime, setSmsScheduleTime] = useState('')
  const [pendingTasks, setPendingTasks] = useState<any[]>([])
  const [pendingTasksLoading, setPendingTasksLoading] = useState(false)
  const [showPendingTasks, setShowPendingTasks] = useState(false)
  const [schedulingEmail, setSchedulingEmail] = useState(false)
  const [schedulingSms, setSchedulingSms] = useState(false)

  // Content Lint State
  const [emailLintIssues, setEmailLintIssues] = useState<LintIssue[] | null>(null)
  const [emailLintChecked, setEmailLintChecked] = useState(false)
  const [smsLintIssues, setSmsLintIssues] = useState<LintIssue[] | null>(null)
  const [smsLintChecked, setSmsLintChecked] = useState(false)

  const emailRecipients = claims.filter(c => c.customerEmail)

  const smsRecipients = claims.filter(c => c.customerPhone)

  const toggleEmailAll = () => {
    if (emailSelected.size === emailRecipients.length) {
      setEmailSelected(new Set())
    } else {
      setEmailSelected(new Set(emailRecipients.map((c: any) => c.customerEmail)))
    }
  }

  const toggleEmailOne = (email: string) => {
    setEmailSelected(prev => {
      const next = new Set(prev)
      next.has(email) ? next.delete(email) : next.add(email)
      return next
    })
  }

  const toggleSmsAll = () => {
    if (smsSelected.size === smsRecipients.length) {
      setSmsSelected(new Set())
    } else {
      setSmsSelected(new Set(smsRecipients.map((c: any) => c.customerPhone)))
    }
  }

  const toggleSmsOne = (phone: string) => {
    setSmsSelected(prev => {
      const next = new Set(prev)
      next.has(phone) ? next.delete(phone) : next.add(phone)
      return next
    })
  }

  const handleSendSms = async () => {
    if (!smsMessage.trim() || smsSelected.size === 0) return
    setSmsSending(true)
    setSmsResults(null)
    const selected = smsRecipients
      .filter((c: any) => smsSelected.has(c.customerPhone))
      .map((c: any) => ({ phone: c.customerPhone, name: c.customerName || null }))
    try {
      const res = await fetch('/api/store/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantSlug, merchantId, recipients: selected, message: smsMessage }),
      })
      const data = await res.json()
      if (data.success) {
        setSmsResults(data.results)
      } else {
        setSmsResults([{ phone: '', name: null, status: 'failed', error: data.error || '发送失败' }])
      }
    } catch (e: any) {
      setSmsResults([{ phone: '', name: null, status: 'failed', error: e.message }])
    } finally {
      setSmsSending(false)
      if (merchantId) loadSmsLogs()
    }
  }

  const loadSmsLogs = async () => {
    if (!merchantId) return
    setSmsLogsLoading(true)
    try {
      const res = await fetch(`/api/store/sms-logs?merchantId=${merchantId}&merchantSlug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setSmsLogs(data.logs)
        setSmsLogStats(data.stats)
      }
    } catch { /* ignore */ } finally {
      setSmsLogsLoading(false)
    }
  }

  // --- Scheduled Send helpers ---
  /** Format a UTC date as local time in the merchant's timezone */
  const formatLocalTime = (utcStr: string) => {
    try {
      return new Date(utcStr).toLocaleString('zh-CN', {
        timeZone: merchantTimezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      })
    } catch { return utcStr }
  }

  /** Get min datetime value for the merchant's time picker (now + 5 min in merchant TZ) */
  const getMinScheduleTime = () => {
    const d = new Date(Date.now() + 5 * 60 * 1000)
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: merchantTimezone,
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).formatToParts(d)
      const get = (t: string) => parts.find(p => p.type === t)?.value || '00'
      return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`
    } catch {
      const pad = (n: number) => String(n).padStart(2, '0')
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
    }
  }

  /** Show current time in merchant timezone as HH:MM string */
  const getCurrentMerchantTime = () => {
    try {
      return new Date().toLocaleString('zh-CN', {
        timeZone: merchantTimezone,
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      }).replace(/\//g, '-')
    } catch { return '' }
  }

  const scheduleEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || emailSelected.size === 0 || !emailScheduleTime) return
    setSchedulingEmail(true)
    const recipients = emailRecipients
      .filter((c: any) => emailSelected.has(c.customerEmail))
      .map((c: any) => ({ email: c.customerEmail, name: c.customerName || null }))
    try {
      const res = await fetch('/api/store/schedule-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug, merchantId,
          type: 'email', recipients,
          subject: emailSubject, body: emailBody,
          scheduledLocalTime: emailScheduleTime, // naked merchant-TZ string; API does localToUTC
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ 定时邮件已设置！将在 ${formatLocalTime(data.scheduledAt)} 发送`)
        setEmailScheduleMode('now')
        setEmailScheduleTime('')
        loadPendingTasks()
      } else {
        alert('❌ ' + (data.error || '设置失败'))
      }
    } catch (e: any) {
      alert('❌ ' + e.message)
    } finally {
      setSchedulingEmail(false)
    }
  }

  const scheduleSms = async () => {
    if (!smsMessage.trim() || smsSelected.size === 0 || !smsScheduleTime) return
    setSchedulingSms(true)
    const recipients = smsRecipients
      .filter((c: any) => smsSelected.has(c.customerPhone))
      .map((c: any) => ({ phone: c.customerPhone, name: c.customerName || null }))
    try {
      const res = await fetch('/api/store/schedule-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug, merchantId,
          type: 'sms', recipients,
          body: smsMessage,
          scheduledLocalTime: smsScheduleTime, // naked merchant-TZ string; API does localToUTC
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert(`✅ 定时短信已设置！将在 ${formatLocalTime(data.scheduledAt)} 发送`)
        setSmsScheduleMode('now')
        setSmsScheduleTime('')
        loadPendingTasks()
      } else {
        alert('❌ ' + (data.error || '设置失败'))
      }
    } catch (e: any) {
      alert('❌ ' + e.message)
    } finally {
      setSchedulingSms(false)
    }
  }

  const loadPendingTasks = async () => {
    if (!merchantId) return
    setPendingTasksLoading(true)
    try {
      const res = await fetch(`/api/store/scheduled-messages?merchantId=${merchantId}&merchantSlug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) setPendingTasks(data.tasks || [])
    } catch { /* ignore */ } finally {
      setPendingTasksLoading(false)
    }
  }

  const cancelTask = async (taskId: string) => {
    await fetch(`/api/store/scheduled-messages?id=${taskId}&merchantId=${merchantId}`, { method: 'DELETE' })
    loadPendingTasks()
  }


  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || emailSelected.size === 0) return
    setEmailSending(true)
    setEmailResults(null)
    const selected = emailRecipients
      .filter((c: any) => emailSelected.has(c.customerEmail))
      .map((c: any) => ({ email: c.customerEmail, name: c.customerName || null, couponCode: c.code || undefined, expectedVisitDate: c.expectedVisitDate || undefined }))
    try {
      const res = await fetch('/api/store/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ merchantSlug, merchantId, recipients: selected, subject: emailSubject, bodyText: emailBody }),
      })
      const data = await res.json()
      if (data.success && data.queued) {
        // Large batch — queued for background processing
        setEmailResults([{
          email: '',
          name: null,
          status: 'queued',
          error: `📤 已进入后台队列，共 ${data.total} 封邮件正在逐批发送（每分钟约 15 封）。请在"待发队列"中查看进度。`,
        }])
        setShowPendingTasks(true)
        loadPendingTasks()
      } else if (data.success) {
        setEmailResults(data.results)
      } else {
        setEmailResults([{ email: '', name: null, status: 'failed', error: data.error || '发送失败' }])
      }
    } catch (e: any) {
      setEmailResults([{ email: '', name: null, status: 'failed', error: e.message }])
    } finally {
      setEmailSending(false)
      if (merchantId) loadEmailLogs()
    }
  }


  const loadEmailLogs = async () => {
    if (!merchantId) return
    setEmailLogsLoading(true)
    try {
      const res = await fetch(`/api/store/email-logs?merchantId=${merchantId}&merchantSlug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setEmailLogs(data.logs)
        setEmailLogStats(data.stats)
      }
    } catch { /* ignore */ } finally {
      setEmailLogsLoading(false)
    }
  }

  const fetchClaims = async () => {
    setClaimsLoading(true)
    try {
      const res = await fetch(`/api/store/claims?slug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setClaims(data.claims)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setClaimsLoading(false)
    }
  }

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const res = await fetch(`/api/store/redemptions?slug=${merchantSlug}`)
      const data = await res.json()
      if (data.success) {
        setFullHistory(data.redemptions)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleOpenHistory = () => {
    setShowHistoryModal(true)
    fetchHistory()
  }

  // ... (Keep Auth useEffects same as original) ...
  // Check if already authenticated in this session
  useEffect(() => {
    const authKey = `store_auth_${merchantSlug}`
    const stored = sessionStorage.getItem(authKey)
    if (stored) {
      const { authenticated, merchantName: name, merchantId: id, timezone, timestamp } = JSON.parse(stored)
      // Session valid for 8 hours
      if (authenticated && Date.now() - timestamp < 8 * 60 * 60 * 1000) {
        setIsAuthenticated(true)
        setMerchantName(name)
        setMerchantId(id)
        if (timezone) setMerchantTimezone(timezone)
      } else {
        sessionStorage.removeItem(authKey)
      }
    }
  }, [merchantSlug])

  // Fetch stats and claims when authenticated
  useEffect(() => {
    if (isAuthenticated && merchantSlug) {
      fetch(`/api/store/stats?slug=${merchantSlug}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setStats(data.stats)
          }
        })
        .catch(err => console.error('Failed to load stats', err))

      fetchClaims()
    }
  }, [isAuthenticated, merchantSlug])

  const handlePinSubmit = async () => {
    if (!pin.trim()) {
      setPinError('请输入密码')
      return
    }

    setPinLoading(true)
    setPinError('')

    try {
      const res = await fetch('/api/store/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantSlug,
          pin: pin.trim()
        })
      })

      const data = await res.json()

      if (data.success) {
        // Store authentication in session
        const authKey = `store_auth_${merchantSlug}`
        sessionStorage.setItem(authKey, JSON.stringify({
          authenticated: true,
          merchantName: data.merchantName,
          merchantId: data.merchantId,
          timezone: data.timezone || 'America/New_York',
          timestamp: Date.now()
        }))

        setIsAuthenticated(true)
        setMerchantName(data.merchantName)
        setMerchantId(data.merchantId)
        if (data.timezone) setMerchantTimezone(data.timezone)
        setPin('')
      } else {
        setPinError(data.message || '密码错误')
      }
    } catch (error: any) {
      setPinError('验证失败，请重试')
    } finally {
      setPinLoading(false)
    }
  }

  const handlePinKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !pinLoading) {
      handlePinSubmit()
    }
  }

  // Step 1: Verify Coupon
  const handleVerify = async () => {
    if (!couponCode.trim()) {
      setResult({
        success: false,
        error: '请输入优惠券代码',
        message: '请输入优惠券代码'
      })
      return
    }

    setVerifying(true)
    setResult(null)

    try {
      const res = await fetch('/api/store/verify-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          merchantId
        })
      })

      const data = await res.json()

      if (data.success) {
        setVerificationData(data.coupon)
        setShowConfirmModal(true)
      } else {
        // Show error immediately if invalid
        setResult({
          success: false,
          message: data.message,
          errorCode: data.errorCode,
          error: data.message
        })
        // If already redeemed, add to history to show user
        if (data.errorCode === 'ALREADY_REDEEMED') {
          // We'd ideally want the coupon name here too, but verify endpoint might verify before checking redeemed.
          // Actually my verify logic checks redeemed status.
          // We can proceed to redeem if we want to record the attempt, but verify just returned error.
          // Let's just show the error result.
        }
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: '网络错误，请检查连接'
      })
    } finally {
      setVerifying(false)
    }
  }

  // Step 2: Confirm Redeem
  const handleRedeemConfirm = async () => {
    setShowConfirmModal(false)
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/store/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          merchantId // Validate coupon belongs to this merchant
        })
      })

      const data = await res.json()

      setResult(data)

      // Add to history with Name
      if (data.success || data.errorCode === 'ALREADY_REDEEMED') {
        const newItem: RedeemHistoryItem = {
          code: couponCode.trim().toUpperCase(),
          // Use verification data for name if available, or fallback
          // The redeem endpoint returns `coupon.offer`, we can use that too.
          couponName: verificationData?.name || data.coupon?.offer || '优惠券',
          time: new Date().toISOString(), // Store as ISO string for consistent parsing
          success: data.success
        }
        setHistory(prev => [newItem, ...prev.slice(0, 9)])

        // Refresh stats after successful redemption
        if (data.success) {
          fetch(`/api/store/stats?slug=${merchantSlug}`)
            .then(res => res.json())
            .then(s => {
              if (s.success) setStats(s.stats)
            })
        }
      }

      // Clear input on success
      if (data.success) {
        setTimeout(() => {
          setCouponCode('')
          setResult(null)
          setVerificationData(null)
        }, 5000) // Slightly longer to read success message
      }

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
        message: '网络错误，请检查连接'
      })
    } finally {
      setLoading(false)
    }
  }

  // Key Press Handler (Triggers Verify)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !verifying && !loading) {
      handleVerify()
    }
  }

  const handleLogout = () => {
    const authKey = `store_auth_${merchantSlug}`
    sessionStorage.removeItem(authKey)
    setIsAuthenticated(false)
    setMerchantName('')
    setMerchantId('')
    setHistory([])
    setStats(null)
  }

  // PIN Entry Screen
  if (!isAuthenticated) {
    // ... (Keep existing PIN screen exact logic) ...
    // To save tokens, I will assume the previous implementation of PIN screen is perfect 
    // and I'll just paste the relevant JSX structure or re-use if I could partially update.
    // Since I must replace the file content, I will re-write the PIN screen logic.
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          {/* ... keeping header ... */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-4">
              <span className="text-4xl">🔐</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              店内核销系统
            </h1>
            <p className="text-gray-600 text-sm">
              {merchantSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
                输入店内密码
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value)
                  setPinError('')
                }}
                onKeyPress={handlePinKeyPress}
                placeholder="••••"
                disabled={pinLoading}
                autoFocus
                className="w-full px-4 py-4 text-2xl text-center tracking-widest border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {pinError && (
                <p className="mt-2 text-sm text-red-600">{pinError}</p>
              )}
            </div>

            <button
              onClick={handlePinSubmit}
              disabled={pinLoading || !pin.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {pinLoading ? '验证中...' : '🔓 解锁'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Redemption Screen (Authenticated)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center relative">
          <button
            onClick={handleLogout}
            className="absolute top-4 right-4 text-xs text-gray-400 hover:text-gray-600"
          >
            退出
          </button>
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full">
              <span className="text-3xl">🏪</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {merchantName}
          </h1>
          <p className="text-gray-500 text-sm">核销终端</p>
          <p className="text-xs text-blue-600 mt-1 font-medium italic">
            数据实时更新 (NY Time) | {getNYLastUpdatedMessage()}
          </p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
              <div className="bg-orange-50/80 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-xs font-bold text-orange-600 uppercase">今日核销</p>
                <p className="text-2xl font-bold text-orange-900 mt-1">{stats.todayRedemptions}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-purple-600 uppercase">累计核销</p>
                <div className="flex items-end justify-center gap-2 mt-1">
                  <p className="text-2xl font-bold text-purple-900">{stats.totalRedemptions}</p>
                  <button
                    onClick={handleOpenHistory}
                    className="text-xs text-purple-500 underline mb-1 hover:text-purple-700"
                  >
                    详情
                  </button>
                </div>
              </div>
            </div>

            {/* New Analytics Row: Views, Claims */}
            <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-blue-600 uppercase">浏览量</p>
                <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalViews}</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-xs font-bold text-green-600 uppercase">领取量</p>
                <p className="text-2xl font-bold text-green-900 mt-1">{stats.totalClaims}</p>
              </div>
            </div>

            {/* Real Data Perspective for Merchant */}
            <div className="bg-blue-600 rounded-2xl shadow-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium opacity-90">📊 运营数据透视 (真实数据)</span>
                <div className="flex gap-4 text-sm font-bold">
                  <span>领取: {stats.totalClaims}</span>
                  <span>核销: {stats.totalRedemptions}</span>
                </div>
              </div>
              <div className="mt-2 h-1.5 bg-blue-400/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${stats.totalClaims > 0 ? (stats.totalRedemptions / stats.totalClaims) * 100 : 0}%` }}
                />
              </div>
              <p className="text-[10px] mt-1.5 opacity-70 text-right">核销率: {stats.totalClaims > 0 ? ((stats.totalRedemptions / stats.totalClaims) * 100).toFixed(1) : 0}%</p>
            </div>
          </div>
        )}

        {/* Main Redeem Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="couponCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                输入优惠券代码
              </label>
              <input
                id="couponCode"
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="例如: BDRA-A7K9"
                disabled={loading || verifying}
                autoFocus
                className="w-full px-4 py-4 text-2xl font-mono text-center tracking-wider border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
              />
            </div>

            <button
              onClick={handleVerify}
              disabled={loading || verifying || !couponCode.trim()}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold text-xl py-5 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {verifying ? '查询中...' : '下一步: 验证'}
            </button>
          </div>

          {/* Result Message (Error or Success) */}
          {result && (
            <div className="mt-6 animation-fade-in">
              {result.success ? (
                <div className="bg-orange-50/80 border-2 border-orange-400 rounded-xl p-6 space-y-3 text-center backdrop-blur-sm">
                  <div className="text-5xl mb-2">✅</div>
                  <h3 className="text-2xl font-bold text-orange-800">核销成功!</h3>
                  <div className="text-orange-700">
                    <p className="font-bold text-lg">{result.coupon?.offer}</p>
                    <p className="text-sm opacity-80">顾客: {result.coupon?.customer}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border-2 border-red-500 rounded-xl p-6 flex items-start gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {result.errorCode === 'ALREADY_REDEEMED' ? '⚠️' : '❌'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-800">
                      {result.errorCode === 'ALREADY_REDEEMED' ? '已核销' : '核销失败'}
                    </h3>
                    <p className="text-red-700 text-sm mt-1">{result.message}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📋</span> 最近核销
            </h2>
            <div className="space-y-3">
              {history.map((item, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border l-4 ${item.success ? 'bg-orange-50/80 border-orange-200' : 'bg-orange-50 border-orange-200'}`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{item.couponName || 'Unknown Coupon'}</span>
                    <span className="font-mono text-xs text-gray-500">{item.code}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {formatToNYTime(item.time, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-lg">
                      {item.success ? '✅' : '⚠️'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Claim Records */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>👥</span> 领取记录
          </h2>
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">姓名</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">电话/邮箱</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">优惠券码</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">领取时间</th>
                  <th className="px-2 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">预约到访</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {claimsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-sm text-gray-500">加载中...</td>
                  </tr>
                ) : claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-2 py-8 text-center text-sm text-gray-500">暂无领取记录</td>
                  </tr>
                ) : (
                  claims.map((claim, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-2 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.customerName}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-500">
                        <div>{claim.customerPhone}</div>
                        <div className="opacity-60">{claim.customerEmail}</div>
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs font-mono text-gray-600">{claim.code}</td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-400">
                        {formatToNYTime(claim.createdAt, {
                          month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                        })}
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap text-xs text-gray-600 font-medium">
                        {claim.expectedVisitDate ? new Date(claim.expectedVisitDate).toLocaleDateString('zh-CN', {
                          month: '2-digit', day: '2-digit'
                        }) : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Email Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>✉️</span> 主动发邮件
            </h2>
            <button
              onClick={() => {
                const next = !showEmailPanel
                setShowEmailPanel(next)
                setEmailResults(null)
                if (next && emailLogs.length === 0) loadEmailLogs()
              }}
              className="text-sm px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition-colors"
            >
              {showEmailPanel ? '收起 ▲' : '展开 ▼'}
            </button>
          </div>

          {showEmailPanel && (
            <div className="space-y-4">
              {emailResults ? (
                <div className="space-y-2">
                  {emailResults[0]?.status === 'queued' ? (
                    // Large batch queued — show info banner
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
                      <p className="font-bold mb-1">📤 后台发送中</p>
                      <p>{emailResults[0].error}</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-gray-700 mb-2">
                        发送完成：✅ {emailResults.filter(r => r.status === 'success').length} 成功 / ❌ {emailResults.filter(r => r.status === 'failed').length} 失败
                      </p>
                      {emailResults.filter(r => r.email).map((r, i) => (
                        <div key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${r.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                          <span>{r.status === 'success' ? '✅' : '❌'}</span>
                          <span>{r.name || r.email}</span>
                          <span className="text-xs opacity-60">{r.email}</span>
                          {r.error && <span className="text-xs text-red-500">{r.error}</span>}
                        </div>
                      ))}
                    </>
                  )}
                  <button
                    onClick={() => { setEmailResults(null); setEmailSubject(''); setEmailBody(''); setEmailSelected(new Set()) }}
                    className="w-full mt-2 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 text-sm"
                  >
                    再发一封
                  </button>
                </div>

              ) : (
                <>
                  {/* Recipient Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">选择收件人（{emailSelected.size}/{emailRecipients.length}）</span>
                      <button onClick={toggleEmailAll} className="text-xs text-blue-600 underline">
                        {emailSelected.size === emailRecipients.length ? '取消全选' : '全选'}
                      </button>
                    </div>
                    {emailRecipients.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">暂无有邮箱的客户</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                        {emailRecipients.map((c: any, i: number) => (
                          <label key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={emailSelected.has(c.customerEmail)}
                              onChange={() => toggleEmailOne(c.customerEmail)}
                              className="accent-blue-600"
                            />
                            <span className="text-sm font-medium text-gray-800">{c.customerName}</span>
                            <span className="text-xs text-gray-400">{c.customerEmail}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮件主题</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="例：感谢您的光临！"
                      className={`w-full px-3 py-2 border rounded-xl text-sm focus:outline-none transition-colors ${(() => {
                        const SPAM = ['FREE', 'FINAL CALL', 'ACT NOW', 'LIMITED TIME', 'URGENT', 'CLICK HERE', 'WINNER', 'PRIZE', 'CASH'];
                        const txt = (emailSubject + ' ' + emailBody).toUpperCase();
                        return SPAM.some(w => txt.includes(w)) ? 'border-red-400 focus:border-red-500' : 'border-gray-300 focus:border-blue-400';
                      })()
                        }`}
                    />
                  </div>

                  {/* Spam check button */}
                  <div>
                    <button
                      onClick={() => { setEmailLintIssues(lintEmail(emailSubject, emailBody)); setEmailLintChecked(true) }}
                      disabled={!emailSubject.trim() && !emailBody.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      🔍 检查邮件内容
                    </button>
                    {emailLintChecked && emailLintIssues && <LintPanel issues={emailLintIssues} />}
                  </div>

                  {/* Body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">邮件正文</label>
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      placeholder="输入你想发给客户的内容..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-blue-400 resize-none"
                    />
                  </div>

                  {/* Schedule Mode Toggle + Send */}
                  <div className="border border-gray-100 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setEmailScheduleMode('now')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${emailScheduleMode === 'now'
                          ? 'bg-blue-100 text-blue-700 border border-blue-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                      >
                        ⚡ 立即发送
                      </button>
                      <button
                        onClick={() => setEmailScheduleMode('later')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${emailScheduleMode === 'later'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                      >
                        🕐 定时发送
                      </button>
                    </div>

                    {emailScheduleMode === 'later' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs text-gray-500">发送时间（请输入{merchantTimezone}时区时间）</label>
                          <span className="text-xs text-indigo-500 font-medium">当前门店时间：{getCurrentMerchantTime()}</span>
                        </div>
                        <input
                          type="datetime-local"
                          value={emailScheduleTime}
                          onChange={e => setEmailScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400"
                        />
                        <button
                          onClick={scheduleEmail}
                          disabled={schedulingEmail || emailSelected.size === 0 || !emailSubject.trim() || !emailBody.trim() || !emailScheduleTime}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm shadow hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {schedulingEmail ? '排队中...' : `🕐 定时发送给 ${emailSelected.size} 位客户`}
                        </button>
                      </div>
                    )}

                    {emailScheduleMode === 'now' && (
                      <button
                        onClick={handleSendEmail}
                        disabled={emailSending || emailSelected.size === 0 || !emailSubject.trim() || !emailBody.trim()}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {emailSending ? `发送中...` : `✉️ 发送给 ${emailSelected.size} 位客户`}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email Send History */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => {
                setShowEmailLogs(v => !v)
                if (!showEmailLogs && emailLogs.length === 0) loadEmailLogs()
              }}
              className="w-full flex items-center justify-between text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors py-1"
            >
              <span className="flex items-center gap-2">
                📋 发送记录
                {emailLogStats && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">共 {emailLogStats.total} 条 · 成功 {emailLogStats.success}</span>
                )}
              </span>
              <span className="text-gray-400">{showEmailLogs ? '▲' : '▼'}</span>
            </button>
            {showEmailLogs && (
              <div className="mt-3">
                {emailLogsLoading ? (
                  <p className="text-center text-sm text-gray-400 py-4">加载中...</p>
                ) : emailLogs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4">暂无发送记录</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {emailLogs.map((log: any) => (
                      <div key={log.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${log.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span>{log.status === 'success' ? '✅' : '❌'}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-800">{log.recipient_name || log.recipient_email}</span>
                        </div>
                        <div className="text-gray-500 truncate max-w-[100px] hidden sm:block">{log.subject}</div>
                        <div className="text-gray-400 whitespace-nowrap flex-shrink-0">
                          {new Date(log.sent_at).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* SMS Panel */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>💬</span> 主动发短信
            </h2>
            <button
              onClick={() => {
                const next = !showSmsPanel
                setShowSmsPanel(next)
                setSmsResults(null)
                if (next && smsLogs.length === 0) loadSmsLogs()
              }}
              className="text-sm px-3 py-1.5 rounded-lg bg-green-50 text-green-600 font-medium hover:bg-green-100 transition-colors"
            >
              {showSmsPanel ? '收起 ▲' : '展开 ▼'}
            </button>
          </div>

          {showSmsPanel && (
            <div className="space-y-4">
              {smsResults ? (
                <div className="space-y-2">
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    发送完成：✅ {smsResults.filter(r => r.status === 'success').length} 成功 / ❌ {smsResults.filter(r => r.status === 'failed').length} 失败
                  </p>
                  {smsResults.filter(r => r.phone).map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${r.status === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                      <span>{r.status === 'success' ? '✅' : '❌'}</span>
                      <span>{r.name || r.phone}</span>
                      <span className="text-xs opacity-60 font-mono">{r.phone}</span>
                      {r.error && <span className="text-xs text-red-500">{r.error}</span>}
                    </div>
                  ))}
                  <button
                    onClick={() => { setSmsResults(null); setSmsMessage(''); setSmsSelected(new Set()) }}
                    className="w-full mt-2 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 text-sm"
                  >
                    再发一条
                  </button>
                </div>
              ) : (
                <>
                  {/* SMS Recipient Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">选择收件人（{smsSelected.size}/{smsRecipients.length}）</span>
                      <button onClick={toggleSmsAll} className="text-xs text-green-600 underline">
                        {smsSelected.size === smsRecipients.length ? '取消全选' : '全选'}
                      </button>
                    </div>
                    {smsRecipients.length === 0 ? (
                      <p className="text-sm text-gray-400 py-2">暂无留有手机号的客户</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                        {smsRecipients.map((c: any, i: number) => (
                          <label key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={smsSelected.has(c.customerPhone)}
                              onChange={() => toggleSmsOne(c.customerPhone)}
                              className="accent-green-600"
                            />
                            <span className="text-sm font-medium text-gray-800">{c.customerName}</span>
                            <span className="text-xs text-gray-400 font-mono">{c.customerPhone}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">短信内容</label>
                    <textarea
                      value={smsMessage}
                      onChange={e => setSmsMessage(e.target.value)}
                      placeholder="输入你想发给客户的短信内容..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-green-400 resize-none"
                    />
                    <div className="text-right text-xs text-gray-400 mt-0.5">{smsMessage.length}/160{smsMessage.length > 160 ? '（超出将按多条计费）' : ''}</div>
                  </div>

                  {/* SMS lint check button */}
                  <div>
                    <button
                      onClick={() => { setSmsLintIssues(lintSmsContent(smsMessage)); setSmsLintChecked(true) }}
                      disabled={!smsMessage.trim()}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-100 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      🔍 检查短信内容
                    </button>
                    {smsLintChecked && smsLintIssues && <LintPanel issues={smsLintIssues} />}
                  </div>

                  {/* Schedule Mode Toggle + Send */}
                  <div className="border border-gray-100 rounded-xl p-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSmsScheduleMode('now')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${smsScheduleMode === 'now'
                          ? 'bg-green-100 text-green-700 border border-green-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                      >
                        ⚡ 立即发送
                      </button>
                      <button
                        onClick={() => setSmsScheduleMode('later')}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all ${smsScheduleMode === 'later'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-50 text-gray-500 border border-gray-200'
                          }`}
                      >
                        🕐 定时发送
                      </button>
                    </div>

                    {smsScheduleMode === 'later' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs text-gray-500">发送时间（请输入{merchantTimezone}时区时间）</label>
                          <span className="text-xs text-emerald-500 font-medium">当前门店时间：{getCurrentMerchantTime()}</span>
                        </div>
                        <input
                          type="datetime-local"
                          value={smsScheduleTime}
                          onChange={e => setSmsScheduleTime(e.target.value)}
                          className="w-full px-3 py-2 border border-emerald-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400"
                        />
                        <button
                          onClick={scheduleSms}
                          disabled={schedulingSms || smsSelected.size === 0 || !smsMessage.trim() || !smsScheduleTime}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {schedulingSms ? '排队中...' : `🕐 定时发送给 ${smsSelected.size} 位客户`}
                        </button>
                      </div>
                    )}

                    {smsScheduleMode === 'now' && (
                      <button
                        onClick={handleSendSms}
                        disabled={smsSending || smsSelected.size === 0 || !smsMessage.trim()}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm shadow hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {smsSending ? `发送中...` : `💬 发送给 ${smsSelected.size} 位客户`}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* SMS Send History */}
          <div className="mt-4 border-t border-gray-100 pt-4">
            <button
              onClick={() => {
                setShowSmsLogs(v => !v)
                if (!showSmsLogs && smsLogs.length === 0) loadSmsLogs()
              }}
              className="w-full flex items-center justify-between text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors py-1"
            >
              <span className="flex items-center gap-2">
                📋 发送记录
                {smsLogStats && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">共 {smsLogStats.total} 条 · 成功 {smsLogStats.success}</span>
                )}
              </span>
              <span className="text-gray-400">{showSmsLogs ? '▲' : '▼'}</span>
            </button>
            {showSmsLogs && (
              <div className="mt-3">
                {smsLogsLoading ? (
                  <p className="text-center text-sm text-gray-400 py-4">加载中...</p>
                ) : smsLogs.length === 0 ? (
                  <p className="text-center text-sm text-gray-400 py-4">暂无发送记录</p>
                ) : (
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {smsLogs.map((log: any) => (
                      <div key={log.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${log.status === 'success' ? 'bg-green-50' : 'bg-red-50'}`}>
                        <span>{log.status === 'success' ? '✅' : '❌'}</span>
                        <div className="flex-1 min-w-0">
                          <span className="font-medium text-gray-800">{log.recipient_name || log.recipient_phone}</span>
                        </div>
                        <div className="text-gray-500 truncate max-w-[100px] hidden sm:block text-xs">{log.message?.slice(0, 20)}...</div>
                        <div className="text-gray-400 whitespace-nowrap flex-shrink-0">
                          {new Date(log.sent_at).toLocaleString('en-US', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && verificationData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤔</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900">确认核销?</h3>
              <p className="text-sm text-gray-500 mt-1">请确认顾客信息与优惠券</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-6 border border-gray-100">
              <div className="flex justify-between items-start">
                <span className="text-gray-500 text-xs uppercase font-bold">优惠券</span>
                <span className="text-right font-bold text-gray-900">{verificationData.name}</span>
              </div>
              <div className="h-px bg-gray-200 w-full" />
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs uppercase font-bold">顾客姓名</span>
                <span className="text-right font-medium text-gray-900">{verificationData.customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-xs uppercase font-bold">顾客电话</span>
                <span className="text-right font-mono text-sm text-gray-600">{verificationData.customerPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false)
                  setCouponCode('') // Check if user wants to clear or keep? Usually cancel means "wrong code", so clear/keep is debatable. Let's keep it so they can edit.
                }}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 font-bold hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleRedeemConfirm}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-colors"
              >
                确认核销
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span>📋</span> 全部核销记录 (最近100条)
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {historyLoading ? (
                <div className="p-12 text-center text-gray-500">
                  加载中...
                </div>
              ) : fullHistory.length === 0 ? (
                <div className="p-12 text-center text-gray-500">
                  暂无核销记录
                </div>
              ) : (
                <div className="min-w-full inline-block align-middle">
                  <div className="border rounded-lg overflow-hidden m-4">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">时间</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">优惠券码</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">折扣项目</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">客户姓名</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">联系方式</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {fullHistory.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatToNYTime(item.redeemed_at, {
                                month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                              })}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {item.code}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {item.offer_name || '优惠券'}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.customer_name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                              <div>{item.customer_phone}</div>
                              <div className="opacity-60">{item.customer_email}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 text-center">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Re-add interfaces update
interface RedeemResult {
  success: boolean
  message: string
  coupon?: {
    code: string
    merchant: string
    offer: string
    customer: string
    redeemedAt: string
  }
  error?: string
  errorCode?: string
}

interface RedeemHistoryItem {
  code: string
  time: string
  success: boolean
  couponName?: string // Newly added
}

interface MerchantPageProps {
  params: Promise<{ merchantSlug: string }>
}
