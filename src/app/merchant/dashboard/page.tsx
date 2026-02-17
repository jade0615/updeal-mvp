'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getMerchantAnalytics, type MerchantAnalytics } from '@/actions/merchant-analytics'
import { logoutMerchantAction } from '@/actions/merchant-auth'
import { getNYLastUpdatedMessage } from '@/lib/utils/date'
import SendRemindersButton from '@/components/merchant/SendRemindersButton'


export default function MerchantDashboardPage() {
    const router = useRouter()
    const [analytics, setAnalytics] = useState<MerchantAnalytics | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [refreshing, setRefreshing] = useState(false)

    const fetchAnalytics = async () => {
        try {
            setRefreshing(true)
            const result = await getMerchantAnalytics()

            if (!result.success) {
                setError(result.error || '获取数据失败')
                if (result.error?.includes('未登录')) {
                    // Redirect to login if session expired
                    router.push('/merchant/login')
                }
                return
            }

            setAnalytics(result.data || null)
            setError('')
        } catch (err) {
            console.error('Error fetching analytics:', err)
            setError('加载数据时出错，请刷新重试')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    const handleLogout = async () => {
        try {
            await logoutMerchantAction()
        } catch (err) {
            console.error('Logout error:', err)
            // Fallback to manual redirect if action fails
            router.push('/merchant/login')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">加载中...</p>
                </div>
            </div>
        )
    }

    if (error && !analytics) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="bg-white p-8 rounded-lg shadow max-w-md w-full">
                    <div className="text-red-600 text-center mb-4">
                        <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold text-center mb-2">加载失败</h2>
                    <p className="text-gray-600 text-center mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchAnalytics}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
                        >
                            重试
                        </button>
                        <button
                            onClick={() => router.push('/merchant/login')}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                        >
                            返回登录
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                {analytics?.merchantName || '商户后台'}
                            </h1>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4">
                                <p className="text-sm text-gray-500 mt-1">数据统计面板</p>
                                <p className="text-xs text-blue-500 mt-1 font-medium bg-blue-50 px-2 py-0.5 rounded-full">
                                    数据更新时间：{getNYLastUpdatedMessage()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={fetchAnalytics}
                                disabled={refreshing}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition disabled:opacity-50"
                            >
                                <svg
                                    className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {refreshing ? '刷新中...' : '刷新数据'}
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                            >
                                退出登录
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Total Views */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-blue-100 rounded-lg p-3">
                                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">总浏览量</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.totalViews.toLocaleString() || 0}</p>
                        <p className="text-xs text-gray-400 mt-2">页面访问次数</p>
                    </div>

                    {/* Total Claims */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-green-100 rounded-lg p-3">
                                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">总领取量</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.totalClaims.toLocaleString() || 0}</p>
                        <p className="text-xs text-gray-400 mt-2">优惠券领取数</p>
                    </div>

                    {/* Total Redemptions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-purple-100 rounded-lg p-3">
                                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">总核销量</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.totalRedemptions.toLocaleString() || 0}</p>
                        <p className="text-xs text-gray-400 mt-2">已使用优惠券</p>
                    </div>

                    {/* Conversion Rate */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="bg-amber-100 rounded-lg p-3">
                                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mb-1">转化率</p>
                        <p className="text-3xl font-bold text-gray-900">{analytics?.conversionRate || '0.00'}%</p>
                        <p className="text-xs text-gray-400 mt-2">浏览到领取转化</p>
                    </div>
                </div>

                {/* Reminders Button */}
                <SendRemindersButton />

                {/* Additional Info */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">使用说明</h2>
                    <div className="space-y-3 text-sm text-gray-600">
                        <div className="flex items-start gap-3">
                            <div className="bg-blue-100 rounded-full p-1 mt-0.5">
                                <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p><strong>总浏览量</strong>: 显示用户访问您的优惠券页面的总次数</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 rounded-full p-1 mt-0.5">
                                <svg className="h-4 w-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p><strong>总领取量</strong>: 显示用户成功领取您的优惠券的总数量</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-purple-100 rounded-full p-1 mt-0.5">
                                <svg className="h-4 w-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p><strong>总核销量</strong>: 显示用户到店使用优惠券的总数量</p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="bg-amber-100 rounded-full p-1 mt-0.5">
                                <svg className="h-4 w-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p><strong>转化率</strong>: 计算公式为 (总领取量 ÷ 总浏览量) × 100%</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                            您的优惠券页面链接: <a href={`/${analytics?.merchantSlug}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">/{analytics?.merchantSlug}</a>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    )
}
