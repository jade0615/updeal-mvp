'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { CustomerData } from '@/actions/customers'
import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import DebouncedInput from '@/components/admin/DebouncedInput'

interface Props {
    data: CustomerData[]
    total: number
    page: number
    limit: number
}

function SortIcon({
    field,
    currentSortField,
    currentSortDir
}: {
    field: string
    currentSortField: string
    currentSortDir: string
}) {
    if (currentSortField !== field) return <ArrowUpDown className="h-4 w-4 text-gray-300" />
    return currentSortDir === 'asc'
        ? <ArrowUp className="h-4 w-4 text-blue-500" />
        : <ArrowDown className="h-4 w-4 text-blue-500" />
}

export default function CustomerTable({ data, total, page, limit }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSortField = searchParams.get('sortField') || 'claimed_at'
    const currentSortDir = searchParams.get('sortDir') || 'desc'

    const totalPages = Math.ceil(total / limit)

    // Helper to update URL params
    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        // Reset page if filtering/sorting changes
        if (key !== 'page') {
            params.set('page', '1')
        }
        router.push(`?${params.toString()}`)
    }

    const handleSort = (field: string) => {
        const isAsc = currentSortField === field && currentSortDir === 'asc'
        updateParam('sortDir', isAsc ? 'desc' : 'asc')
        updateParam('sortField', field)
    }

    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 flex flex-col">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* Internal ID Column - Filterable */}
                            <th className="px-4 py-3 text-left min-w-[100px]">
                                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                    客户编号
                                </div>
                                <input
                                    type="text"
                                    placeholder="编号..."
                                    className="w-full text-xs border rounded px-2 py-1 font-normal"
                                    defaultValue={searchParams.get('internalId') || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const timer = setTimeout(() => updateParam('internalId', val), 500)
                                        return () => clearTimeout(timer)
                                    }}
                                />
                            </th>

                            {/* Phone Column - Sortable + Filterable */}
                            <th className="px-6 py-3 text-left w-1/6 min-w-[180px]">
                                <div
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                                    onClick={() => handleSort('phone')}
                                >
                                    Phone <SortIcon field="phone" currentSortField={currentSortField} currentSortDir={currentSortDir} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter Phone..."
                                    className="w-full text-xs border rounded px-2 py-1 font-normal"
                                    defaultValue={searchParams.get('phone') || ''}
                                    onChange={(e) => {
                                        // We use a simple debounce here or rely on the fact that standard inputs don't debounce automatically.
                                        // For a cleaner implementation, we should use a debounced callback.
                                        // But for this inline input, let's use the DebouncedInput logic wrapper or just simple timeout.
                                        // Re-using the logic from DebouncedInput would be best but it renders an Input component.
                                        // Let's just create a quick timeout here.
                                        const val = e.target.value
                                        const timer = setTimeout(() => updateParam('phone', val), 500)
                                        return () => clearTimeout(timer)
                                    }}
                                />
                            </th>

                            {/* Name Column - Sortable + Filterable */}
                            <th className="px-6 py-3 text-left w-1/5 min-w-[150px]">
                                <div
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                                    onClick={() => handleSort('name')}
                                >
                                    Name <SortIcon field="name" currentSortField={currentSortField} currentSortDir={currentSortDir} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter Name..."
                                    className="w-full text-xs border rounded px-2 py-1 font-normal"
                                    defaultValue={searchParams.get('name') || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const timer = setTimeout(() => updateParam('name', val), 500)
                                        return () => clearTimeout(timer)
                                    }}
                                />
                            </th>

                            {/* Merchant Column - Sortable (Filter is external) */}
                            <th className="px-6 py-3 text-left w-1/5">
                                <div
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                                // onClick={() => handleSort('merchant_name')} // Sorting by relation name is complex, keeping disabled or minimal
                                >
                                    Merchant
                                </div>
                                {/* No inline filter here as we have the main dropdown */}
                            </th>

                            {/* Coupon Column - Sortable + Filterable */}
                            <th className="px-6 py-3 text-left w-1/5 min-w-[120px]">
                                <div
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                                    onClick={() => handleSort('coupon_code')}
                                >
                                    Coupon <SortIcon field="coupon_code" currentSortField={currentSortField} currentSortDir={currentSortDir} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Filter Code..."
                                    className="w-full text-xs border rounded px-2 py-1 font-normal"
                                    defaultValue={searchParams.get('coupon') || ''}
                                    onChange={(e) => {
                                        const val = e.target.value
                                        const timer = setTimeout(() => updateParam('coupon', val), 500)
                                        return () => clearTimeout(timer)
                                    }}
                                />
                            </th>

                            {/* Claimed At - Sortable */}
                            <th className="px-6 py-3 text-left w-1/5">
                                <div
                                    className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-500 uppercase tracking-wider mb-2"
                                    onClick={() => handleSort('claimed_at')}
                                >
                                    Claimed At <SortIcon field="claimed_at" currentSortField={currentSortField} currentSortDir={currentSortDir} />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length > 0 ? (
                            data.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="text"
                                            defaultValue={(customer as any).internal_id || ''}
                                            placeholder="—"
                                            className="w-full text-xs font-mono border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:bg-white focus:border-purple-400 focus:outline-none"
                                            onBlur={async (e) => {
                                                const newValue = e.target.value;
                                                if (newValue !== ((customer as any).internal_id || '')) {
                                                    // Save to database via API
                                                    try {
                                                        await fetch('/api/admin/customers/update-internal-id', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                userId: customer.user_id,
                                                                internalId: newValue
                                                            })
                                                        });
                                                    } catch (err) {
                                                        console.error('Failed to update internal ID:', err);
                                                    }
                                                }
                                            }}
                                        />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-medium text-gray-900">
                                        {customer.phone}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {customer.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {customer.merchant_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-500">
                                        {customer.coupon_code}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {customer.claimed_at}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                    No customers found matching your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(page * limit, total)}</span> of{' '}
                            <span className="font-medium">{total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                                onClick={() => updateParam('page', String(Math.max(1, page - 1)))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>

                            {/* Pagination Info Button (Non-clickable useful info) */}
                            <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {page} of {totalPages}
                            </span>

                            <button
                                onClick={() => updateParam('page', String(Math.min(totalPages, page + 1)))}
                                disabled={page >= totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    )
}
