'use client'

import { useState, useMemo } from 'react'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import MerchantDrawer from './MerchantDrawer'

interface Merchant {
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
        today_views: number
        today_redemptions: number
    }
}

interface Props {
    initialMerchants: Merchant[]
}

type SortKey = 'views' | 'claims' | 'redemptions' | 'redemption_rate' | null

interface SortConfig {
    key: SortKey
    direction: 'asc' | 'desc'
}

function SortIcon({
    colKey,
    activeKey,
    direction
}: {
    colKey: SortKey
    activeKey: SortKey
    direction: 'asc' | 'desc'
}) {
    if (activeKey !== colKey) return <ArrowUpDown className="w-3 h-3 text-gray-300 ml-1 inline" />
    return direction === 'asc'
        ? <ArrowUp className="w-3 h-3 text-blue-600 ml-1 inline" />
        : <ArrowDown className="w-3 h-3 text-blue-600 ml-1 inline" />
}

export default function MerchantsTable({ initialMerchants }: Props) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'redemptions', direction: 'desc' });
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

    const sortedData = useMemo(() => {
        const sortable = [...initialMerchants];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                let valA = 0;
                let valB = 0;

                if (sortConfig.key === 'redemption_rate') {
                    valA = parseFloat(a.real_stats.redemption_rate || '0');
                    valB = parseFloat(b.real_stats.redemption_rate || '0');
                } else {
                    // @ts-expect-error - Dynamic access to real_stats keys
                    valA = a.real_stats[sortConfig.key] || 0;
                    // @ts-expect-error - Dynamic access to real_stats keys
                    valB = b.real_stats[sortConfig.key] || 0;
                }

                if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
                if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return sortable;
    }, [initialMerchants, sortConfig]);

    const handleSort = (key: SortKey) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
        }));
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-100 table-fixed">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-[25%]">Merchant Name</th>
                            <th
                                className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-[15%]"
                                onClick={() => handleSort('redemptions')}
                            >
                                Redemptions <SortIcon colKey="redemptions" activeKey={sortConfig.key} direction={sortConfig.direction} />
                            </th>
                            <th
                                className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-[15%]"
                                onClick={() => handleSort('claims')}
                            >
                                Claims <SortIcon colKey="claims" activeKey={sortConfig.key} direction={sortConfig.direction} />
                            </th>
                            <th
                                className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-[15%]"
                                onClick={() => handleSort('redemption_rate')}
                            >
                                Rate <SortIcon colKey="redemption_rate" activeKey={sortConfig.key} direction={sortConfig.direction} />
                            </th>
                            <th
                                className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors w-[15%]"
                                onClick={() => handleSort('views')}
                            >
                                Views <SortIcon colKey="views" activeKey={sortConfig.key} direction={sortConfig.direction} />
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-[15%]">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-50">
                        {sortedData.map((merchant) => (
                            <tr
                                key={merchant.id}
                                onClick={() => setSelectedMerchant(merchant)}
                                className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                            >
                                {/* Merchant Name */}
                                <td className="px-6 py-3.5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900 group-hover:text-blue-700">{merchant.name}</span>
                                        <span className="text-[10px] font-mono text-gray-400 mt-0.5 max-w-[140px] truncate">{merchant.id}</span>
                                    </div>
                                </td>

                                {/* Redemptions */}
                                <td className="px-6 py-3.5 text-right">
                                    <div className="font-bold text-gray-900">{merchant.real_stats.redemptions}</div>
                                </td>

                                {/* Claims */}
                                <td className="px-6 py-3 text-right">
                                    <div className="font-medium text-gray-600">{merchant.real_stats.claims}</div>
                                </td>

                                {/* Rate */}
                                <td className="px-6 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className={`text-sm font-medium ${Number(merchant.real_stats.redemption_rate) > 20 ? 'text-green-600' : 'text-gray-600'}`}>
                                            {merchant.real_stats.redemption_rate}%
                                        </span>
                                        {/* Mini Progress Bar */}
                                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full ${Number(merchant.real_stats.redemption_rate) > 20 ? 'bg-green-500' : 'bg-gray-400'}`}
                                                style={{ width: `${Math.min(Number(merchant.real_stats.redemption_rate), 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </td>

                                {/* Views */}
                                <td className="px-6 py-3 text-right">
                                    <div className="font-medium text-gray-500">{merchant.real_stats.views}</div>
                                </td>

                                {/* Status */}
                                <td className="px-6 py-3 flex justify-center">
                                    <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${merchant.is_active
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-gray-100 text-gray-600 border-gray-200'}
                    `}>
                                        {merchant.is_active ? 'Active' : 'Disabled'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Drawer */}
            <MerchantDrawer
                merchant={selectedMerchant}
                onClose={() => setSelectedMerchant(null)}
            />
        </>
    )
}
