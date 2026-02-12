'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { WalletDownload } from '@/actions/wallet-downloads'
import { ChevronLeft, ChevronRight, Phone, User, Tag, Calendar, Copy, Check, Search, Mail, Smartphone } from 'lucide-react'
import { useState } from 'react'

interface Props {
    data: WalletDownload[]
    total: number
    page: number
    limit: number
    merchantSlugs: string[]
}

export default function WalletDownloadsTable({ data, total, page, limit, merchantSlugs }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')

    const totalPages = Math.ceil(total / limit)

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        if (key !== 'page') {
            params.set('page', '1')
        }
        router.push(`?${params.toString()}`)
    }

    const handleSearch = () => {
        updateParam('search', searchValue)
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Apple Wallet 下载记录</h2>
                        <p className="text-sm text-gray-500">共 {total} 条记录</p>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <select
                            value={searchParams.get('merchantSlug') || ''}
                            onChange={(e) => updateParam('merchantSlug', e.target.value)}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">所有商户</option>
                            {merchantSlugs.map(slug => (
                                <option key={slug} value={slug}>{slug}</option>
                            ))}
                        </select>

                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索姓名、电话或优惠码..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 sm:w-64"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                            搜索
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {data.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">客户信息</th>
                                <th className="px-6 py-4">商户标识</th>
                                <th className="px-6 py-4">优惠码</th>
                                <th className="px-6 py-4">下载时间</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((download) => (
                                <tr key={download.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                <User className="h-4 w-4 text-gray-400" />
                                                {download.customer_name || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Phone className="h-3.5 w-3.5" />
                                                {download.customer_phone || '-'}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="h-3.5 w-3.5" />
                                                {download.customer_email || '-'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Smartphone className="h-4 w-4 text-blue-400" />
                                            <span className="font-medium">{download.merchant_slug}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Tag className="h-4 w-4 text-gray-400" />
                                            <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                {download.coupon_code}
                                            </span>
                                            <button
                                                onClick={() => copyToClipboard(download.coupon_code, download.id)}
                                                className="p-1 hover:bg-gray-100 rounded"
                                            >
                                                {copiedId === download.id ? (
                                                    <Check className="h-3 w-3 text-emerald-500" />
                                                ) : (
                                                    <Copy className="h-3 w-3 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(download.downloaded_at).toLocaleString('zh-CN')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="p-12 text-center">
                    <Smartphone className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">暂无下载记录</p>
                    <p className="text-sm text-gray-400 mt-1">
                        当客户下载 Apple Wallet 票卡时，记录会显示在这里
                    </p>
                </div>
            )}

            {/* Pagination */}
            {total > limit && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-sm text-gray-500">
                        显示 {(page - 1) * limit + 1} - {Math.min(page * limit, total)} 条，共 {total} 条
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => updateParam('page', String(Math.max(1, page - 1)))}
                            disabled={page === 1}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-600 font-medium">
                            第 {page} / {totalPages} 页
                        </span>
                        <button
                            onClick={() => updateParam('page', String(Math.min(totalPages, page + 1)))}
                            disabled={page >= totalPages}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
