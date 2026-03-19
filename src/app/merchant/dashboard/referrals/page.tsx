'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getMerchantReferrals, type MerchantReferralRecord } from '@/actions/merchant-referrals'

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('zh-CN', {
        month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function MerchantReferralsPage() {
    const router = useRouter()
    const [records, setRecords] = useState<MerchantReferralRecord[]>([])
    const [merchantName, setMerchantName] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        getMerchantReferrals().then(res => {
            if (!res.success) {
                setError(res.error || '加载失败')
                if (res.error?.includes('未登录')) router.push('/merchant/login')
            } else {
                setRecords(res.records)
                setMerchantName(res.merchantName)
            }
            setLoading(false)
        })
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto" />
                    <p className="mt-3 text-gray-500 text-sm">加载推荐记录...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl p-8 shadow text-center max-w-sm w-full">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="font-bold text-gray-900 mb-2">加载失败</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
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
                        <h1 className="text-xl font-bold text-gray-900">推荐记录</h1>
                        <p className="text-xs text-gray-400">{merchantName} · 共 {records.length} 条</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* 说明卡片 */}
                <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <span className="text-2xl">🔗</span>
                    <div>
                        <p className="text-sm font-bold text-purple-800">分享链路追踪</p>
                        <p className="text-xs text-purple-600 mt-0.5 leading-relaxed">
                            客户领取优惠券后，可以把专属链接分享给朋友。朋友通过链接领券后，会在这里记录完整的「分享者 → 领取者」关系。
                        </p>
                    </div>
                </div>

                {/* 空状态 */}
                {records.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow p-16 text-center">
                        <div className="text-5xl mb-4">🤝</div>
                        <p className="text-gray-600 font-semibold mb-1">暂无推荐记录</p>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            当客户通过朋友分享的链接领取优惠券时，<br />分享关系会显示在这里
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => (
                            <div
                                key={record.invitee_coupon_id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                            >
                                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr]">

                                    {/* 分享者（推荐人） */}
                                    <div className="p-5">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2.5 py-1 rounded-full">
                                                📤 分享者
                                            </span>
                                        </div>
                                        {record.referrer_phone ? (
                                            <div className="space-y-1.5">
                                                <p className="font-semibold text-gray-900">{record.referrer_name || '姓名未填'}</p>
                                                <p className="text-sm text-gray-500 font-mono">{record.referrer_phone}</p>
                                                {record.referrer_email && (
                                                    <p className="text-xs text-gray-400 truncate">{record.referrer_email}</p>
                                                )}
                                                {record.referrer_coupon_code && (
                                                    <span className="inline-block text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1">
                                                        券码: {record.referrer_coupon_code}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-xs text-gray-400 mb-1">推荐码</p>
                                                <span className="font-mono text-sm font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">
                                                    {record.referral_code}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* 箭头 */}
                                    <div className="flex items-center justify-center px-2 py-3 sm:py-0">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </div>
                                            <span className="text-[10px] text-gray-400">分享</span>
                                        </div>
                                    </div>

                                    {/* 领取者（被推荐人） */}
                                    <div className="p-5 border-t sm:border-t-0 sm:border-l border-gray-100 bg-green-50/40">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                                                🎁 领取者
                                            </span>
                                        </div>
                                        <div className="space-y-1.5">
                                            <p className="font-semibold text-gray-900">{record.invitee_name || '姓名未填'}</p>
                                            <p className="text-sm text-gray-500 font-mono">{record.invitee_phone}</p>
                                            {record.invitee_email && (
                                                <p className="text-xs text-gray-400 truncate">{record.invitee_email}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs font-mono bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded font-medium">
                                                    券码: {record.invitee_coupon_code}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{formatDate(record.invitee_claimed_at)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
