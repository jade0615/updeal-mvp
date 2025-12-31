'use client'

import { useMemo } from 'react'
import { ArrowUpRight, ArrowDownRight, Eye, Ticket, Percent } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, YAxis } from 'recharts'

interface MerchantStats {
    id: string
    name: string
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

// Sparkline Component
const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    const chartData = data.map((val, i) => ({ i, val }))
    return (
        <div className="h-[40px] w-[80px]">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <Area
                        type="monotone"
                        dataKey="val"
                        stroke={color}
                        fill={`url(#gradient-${color})`}
                        strokeWidth={2}
                        dot={false}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    )
}

export default function DashboardHUD({ merchants }: Props) {
    const stats = useMemo(() => {
        let totalViews = 0
        let totalRedemptions = 0
        let totalClaims = 0

        merchants.forEach(m => {
            totalViews += m.real_stats.views || 0
            totalRedemptions += m.real_stats.redemptions || 0
            totalClaims += m.real_stats.claims || 0
        })

        const conversionRate = totalClaims > 0
            ? ((totalRedemptions / totalClaims) * 100).toFixed(1)
            : '0.0'

        return { totalViews, totalRedemptions, conversionRate }
    }, [merchants])

    // Mock trend data for Preview (since we only have point-in-time data in current prop)
    // In production, this would come from historical snapshots.
    const mockTrends = {
        views: [100, 120, 110, 140, 130, 160, 180],
        redemptions: [10, 12, 15, 14, 20, 22, 25],
        conversion: [2.0, 2.1, 2.2, 2.1, 2.3, 2.4, 2.5]
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* 1. Total Views */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-1">
                        <Eye className="w-4 h-4" />
                        <span>Total Views</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 tracking-tight">
                        {stats.totalViews.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>12%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>
                <Sparkline data={mockTrends.views} color="#10b981" />
            </div>

            {/* 2. Total Redemptions */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-1">
                        <Ticket className="w-4 h-4" />
                        <span>Redemptions</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 tracking-tight">
                        {stats.totalRedemptions.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600 bg-green-50 w-fit px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="w-3 h-3" />
                        <span>5%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>
                <Sparkline data={mockTrends.redemptions} color="#6366f1" />
            </div>

            {/* 3. Conversion Rate */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                <div>
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-medium mb-1">
                        <Percent className="w-4 h-4" />
                        <span>Redemption Rate</span>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 tracking-tight">
                        {stats.conversionRate}%
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs font-medium text-red-500 bg-red-50 w-fit px-2 py-0.5 rounded-full">
                        <ArrowDownRight className="w-3 h-3" />
                        <span>1.2%</span>
                        <span className="text-gray-400 font-normal ml-1">vs last period</span>
                    </div>
                </div>
                <Sparkline data={mockTrends.conversion} color="#f59e0b" />
            </div>
        </div>
    )
}
