'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CustomerData } from '@/actions/customers'
import { ChevronLeft, ChevronRight, Phone, User, Tag, Calendar, Copy, Check, Search } from 'lucide-react'
import { useState } from 'react'

interface Props {
    data: CustomerData[]
    total: number
    page: number
    limit: number
    selectedMerchantName?: string
}

export default function CustomerTableNew({ data, total, page, limit, selectedMerchantName }: Props) {
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
            {/* 表头 */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                            {selectedMerchantName ? `${selectedMerchantName} 的客户` : '所有客户'}
                        </h2>
                        <p className="text-sm text-gray-500">共 {total} 条记录</p>
                    </div>

                    {/* 搜索框 */}
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="搜索电话或优惠码..."
                                value={searchValue}
                                onChange={(e) => setSearchValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                            />
                        </div>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition"
                        >
                            搜索
                        </button>
                        {searchParams.get('search') && (
                            <button
                                onClick={() => {
                                    setSearchValue('')
                                    updateParam('search', '')
                                }}
                                className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm"
                            >
                                清除
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 表格内容 */}
            {data.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {data.map((customer) => (
                        <div
                            key={customer.id}
                            className="p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                {/* 编号 */}
                                <div className="flex-shrink-0">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-mono text-sm font-medium">
                                        {customer.auto_id}
                                    </div>
                                </div>

                                {/* 主要信息 */}
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                                    {/* 电话 */}
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <span className="font-mono text-gray-900 font-medium">
                                            {customer.phone}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(customer.phone, `phone-${customer.id}`)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="复制电话"
                                        >
                                            {copiedId === `phone-${customer.id}` ? (
                                                <Check className="h-3 w-3 text-orange-500" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* 姓名 */}
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-600">
                                            {customer.name || '-'}
                                        </span>
                                    </div>

                                    {/* 优惠码 */}
                                    <div className="flex items-center gap-2">
                                        <Tag className="h-4 w-4 text-gray-400" />
                                        <span className="font-mono text-sm bg-gray-100 px-2 py-0.5 rounded">
                                            {customer.coupon_code}
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(customer.coupon_code, `coupon-${customer.id}`)}
                                            className="p-1 hover:bg-gray-100 rounded"
                                            title="复制优惠码"
                                        >
                                            {copiedId === `coupon-${customer.id}` ? (
                                                <Check className="h-3 w-3 text-orange-500" />
                                            ) : (
                                                <Copy className="h-3 w-3 text-gray-400" />
                                            )}
                                        </button>
                                    </div>

                                    {/* 时间 */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">
                                            {customer.claimed_at}
                                        </span>
                                    </div>

                                    {/* 预计到店 */}
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-orange-400" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">预计到店</span>
                                            <span className={`text-sm ${customer.expected_visit_date === '未填写' ? 'text-gray-400' : 'text-orange-600 font-medium'}`}>
                                                {customer.expected_visit_date}
                                            </span>
                                        </div>
                                    </div>

                                    {/* 推荐人 */}
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-purple-400" />
                                        <div className="flex flex-col">
                                            <span className="text-xs text-gray-400">推荐人</span>
                                            <span className={`text-sm ${!customer.referred_by ? 'text-gray-400' : 'text-purple-600 font-medium'}`}>
                                                {customer.referred_by || '-'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* 商家标签（仅在查看全部时显示） */}
                                {!selectedMerchantName && (
                                    <div className="flex-shrink-0">
                                        <div className="flex items-center gap-1.5">
                                            {customer.merchant_internal_id && (
                                                <span className="text-xs font-mono bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded">
                                                    {customer.merchant_internal_id}
                                                </span>
                                            )}
                                            <span className="text-sm text-gray-700 max-w-[150px] truncate" title={customer.merchant_name}>
                                                {customer.merchant_name}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="p-12 text-center">
                    <div className="text-gray-400 mb-2">
                        <User className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">暂无客户数据</p>
                    <p className="text-sm text-gray-400 mt-1">
                        {searchParams.get('search') ? '尝试其他搜索条件' : '客户领取优惠券后会显示在这里'}
                    </p>
                </div>
            )}

            {/* 分页 */}
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
                        <span className="px-4 py-2 text-sm text-gray-600">
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
