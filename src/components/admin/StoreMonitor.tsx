'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar, CheckCircle2, Ticket, Eye, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface MerchantStats {
    id: string
    name: string
    slug: string
    internal_id: string | null
    redeem_pin: string | null
    is_active: boolean
    real_stats: {
        views: number
        claims: number
        redemptions: number
        redemption_rate: string
        today_views?: number
        today_redemptions?: number
    }
}

interface Props {
    merchants: MerchantStats[]
}

export default function StoreMonitor({ merchants }: Props) {
    const [search, setSearch] = useState('')

    const filteredMerchants = merchants.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.slug.toLowerCase().includes(search.toLowerCase()) ||
        m.internal_id?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="搜索商家名称、ID或标识..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl">
                    <Calendar className="w-4 h-4" />
                    今日实时数据
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMerchants.map((merchant) => (
                    <div key={merchant.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-slate-50 flex flex-col hover:shadow-2xl transition-all group overflow-hidden relative">
                        {/* Top Info */}
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex-1 min-w-0">
                                <h3 className="text-xl font-bold text-slate-900 truncate mb-1" title={merchant.name}>
                                    {merchant.name}
                                </h3>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md uppercase tracking-wider">
                                        {merchant.slug}
                                    </span>
                                    {merchant.internal_id && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-700 rounded-md uppercase tracking-wider">
                                            #{merchant.internal_id}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <Link
                                href={`/admin/merchants/${merchant.id}/edit`}
                                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                            >
                                <ArrowUpRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {/* PIN Banner */}
                        <div className="mb-6 flex items-center justify-between text-xs font-bold text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
                            <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                核销终端密码
                            </span>
                            <span className="text-slate-900 font-mono tracking-widest bg-white px-2 py-0.5 rounded shadow-sm">
                                {merchant.redeem_pin || '未设置'}
                            </span>
                        </div>

                        {/* Stats Rows */}
                        <div className="space-y-4 mb-6">
                            <StatRow
                                icon={<CheckCircle2 className="w-4 h-4" />}
                                label="✅ 核销"
                                value={merchant.real_stats.today_redemptions || 0}
                                total={merchant.real_stats.redemptions}
                                color="text-emerald-600"
                                bg="bg-emerald-50"
                            />
                            <StatRow
                                icon={<Ticket className="w-4 h-4" />}
                                label="🎟️ 领取"
                                value={merchant.real_stats.claims} // Should we show today's claims? getAllMerchantsStats doesn't have it yet.
                                color="text-orange-600"
                                bg="bg-orange-50"
                            />
                            <StatRow
                                icon={<Eye className="w-4 h-4" />}
                                label="👁️ 浏览"
                                value={merchant.real_stats.today_views || 0}
                                color="text-slate-500"
                                bg="bg-slate-50"
                            />
                        </div>

                        {/* Footer Rate */}
                        <div className="mt-auto pt-4 border-t border-slate-50 flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">核销转化率</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-black text-slate-900">{merchant.real_stats.redemption_rate}%</span>
                                <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${Number(merchant.real_stats.redemption_rate) > 20 ? 'bg-emerald-500' : 'bg-slate-400'}`}
                                        style={{ width: `${Math.min(Number(merchant.real_stats.redemption_rate), 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Active Indicator */}
                        <div className={`absolute top-0 right-0 w-1.5 h-full ${merchant.is_active ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                    </div>
                ))}
            </div>

            {filteredMerchants.length === 0 && (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">没有找到匹配的商家</p>
                </div>
            )}
        </div>
    )
}

function StatRow({ icon, label, value, total, color, bg }: any) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                    {icon}
                </div>
                <span className="text-sm font-bold text-slate-700">{label}</span>
            </div>
            <div className="flex items-baseline gap-1.5 text-right">
                <span className={`text-xl font-black ${color}`}>{value}</span>
                {total !== undefined && (
                    <span className="text-[10px] font-bold text-slate-400">/ 累计 {total}</span>
                )}
            </div>
        </div>
    )
}
