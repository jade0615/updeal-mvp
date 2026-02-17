'use client'

import { useState, useEffect } from 'react'
import { getEligibleRecipientsCount, sendExpirationRemindersAction, type RemindersResult } from '@/actions/reminders'

export default function SendRemindersButton() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [showModal, setShowModal] = useState(false)
    const [result, setResult] = useState<RemindersResult | null>(null)
    const [error, setError] = useState<string | null>(null)

    const fetchCount = async () => {
        const res = await getEligibleRecipientsCount()
        if (res.error) {
            setError(res.error)
        } else {
            setCount(res.count)
        }
    }

    useEffect(() => {
        fetchCount()
    }, [])

    const handleSend = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await sendExpirationRemindersAction()
            setResult(res)
            if (!res.success) {
                setError(res.error || '发送失败')
            }
            // Refresh count after send (it should be 0 or cooldown will hit)
            fetchCount()
        } catch (err) {
            setError('发送过程中出错')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-8">
            <button
                onClick={() => setShowModal(true)}
                disabled={count === 0}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white font-bold rounded-xl shadow-lg hover:bg-orange-700 transition-all disabled:opacity-50 disabled:grayscale cursor-pointer"
            >
                <span className="text-xl">📧</span>
                发送到期提醒邮件
                {count !== null && count > 0 && (
                    <span className="ml-2 bg-white text-orange-600 text-xs px-2 py-0.5 rounded-full">
                        {count} 位待核销客户
                    </span>
                )}
            </button>
            <p className="text-xs text-gray-500 mt-2 text-center">
                向已领券但未使用的客户发送提醒。每 24 小时限发一次。
            </p>

            {/* Confirmation Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6">
                            {!result ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="text-2xl">🔔</span>
                                        确认发送提醒？
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        系统将向 <strong className="text-orange-600">{count}</strong> 位已领券但未核销且留有邮箱的客户发送到期提醒。
                                    </p>

                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition"
                                        >
                                            取消
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={loading}
                                            className="flex-1 px-4 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    发送中...
                                                </>
                                            ) : '确认发送'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={`text-center py-4 ${result.success ? 'text-green-600' : 'text-red-600'}`}>
                                        <div className="text-4xl mb-4">{result.success ? '✅' : '❌'}</div>
                                        <h3 className="text-xl font-bold mb-2">
                                            {result.success ? '发送完成' : '发送失败'}
                                        </h3>
                                        <p className="text-gray-600 mb-6">
                                            {result.message || result.error}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setShowModal(false)
                                            setResult(null)
                                        }}
                                        className="w-full px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                                    >
                                        关闭
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
