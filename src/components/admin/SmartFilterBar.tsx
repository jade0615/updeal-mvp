'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search, Calendar, Filter } from 'lucide-react'
import { useDebouncedCallback } from 'use-debounce';

const PERIODS = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'All Time', value: 'all' },
]

export default function SmartFilterBar() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentPeriod = searchParams.get('period') || 'today'
    const currentQ = searchParams.get('q') || ''

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            return params.toString()
        },
        [searchParams]
    )

    const handlePeriodChange = (val: string) => {
        router.push(`?${createQueryString('period', val)}`)
    }

    const handleSearch = useDebouncedCallback((term: string) => {
        router.push(`?${createQueryString('q', term)}`)
    }, 300)

    return (
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6">

            {/* 1. Date Capsule */}
            <div className="relative group">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border border-gray-200">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                        Date: <span className="text-blue-600 ml-1">{PERIODS.find(p => p.value === currentPeriod)?.label}</span>
                    </span>
                </div>
                {/* Dropdown (Simple hover/group implementation for Preview) */}
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 shadow-xl rounded-lg overflow-hidden hidden group-hover:block z-20">
                    {PERIODS.map(p => (
                        <button
                            key={p.value}
                            onClick={() => handlePeriodChange(p.value)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${currentPeriod === p.value ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-[1px] h-6 bg-gray-200 mx-1"></div>

            {/* 2. Search Input */}
            <div className="flex items-center gap-2 flex-1 min-w-[200px] px-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search merchant, ID, or slug..."
                    defaultValue={currentQ}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-sm placeholder-gray-400 h-8"
                />
            </div>

            {/* 3. Status/More Filter */}
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-dashed border-gray-300 hover:border-gray-400 rounded-lg text-sm text-gray-500 transition-colors">
                <Filter className="w-3.5 h-3.5" />
                Filter Status
            </button>
        </div>
    )
}
