'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

const RANGES = [
    { label: '今日 (Today)', value: 'today' },
    { label: '昨日 (Yesterday)', value: 'yesterday' },
    { label: '近7天 (7D)', value: '7d' },
    { label: '近30天 (30D)', value: '30d' },
    { label: '全部 (All)', value: 'all' },
]

export default function TimeRangeFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentPeriod = searchParams.get('period') || 'today' // Default to Today

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            params.set(name, value)
            return params.toString()
        },
        [searchParams]
    )

    const handleSelect = (period: string) => {
        router.push(`?${createQueryString('period', period)}`)
    }

    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {RANGES.map((range) => {
                const isActive = currentPeriod === range.value
                return (
                    <button
                        key={range.value}
                        onClick={() => handleSelect(range.value)}
                        className={`
              px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap
              ${isActive
                                ? 'bg-white text-blue-600 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                            }
            `}
                    >
                        {range.label}
                    </button>
                )
            })}
        </div>
    )
}
