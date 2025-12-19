'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Check, ChevronsUpDown } from 'lucide-react'

interface Merchant {
    id: string
    name: string
}

interface Props {
    merchants: Merchant[]
}

export default function SearchableMerchantFilter({ merchants }: Props) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentMerchantId = searchParams.get('merchantId') || '' // Changed to camelCase in URL for consistency with other filters

    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')

    const filteredMerchants = useMemo(() => {
        return merchants.filter(m =>
            m.name.toLowerCase().includes(search.toLowerCase())
        )
    }, [merchants, search])

    const selectedMerchant = merchants.find(m => m.id === currentMerchantId)

    const handleSelect = (merchantId: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (merchantId) {
            params.set('merchantId', merchantId)
        } else {
            params.delete('merchantId')
        }
        // Reset page on filter change
        params.set('page', '1')

        router.push(`?${params.toString()}`)
        setIsOpen(false)
    }

    return (
        <div className="relative w-64">
            <div
                className="w-full flex items-center justify-between border rounded-md px-3 py-2 bg-white cursor-pointer hover:bg-gray-50 text-sm"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="truncate text-gray-700">
                    {selectedMerchant ? selectedMerchant.name : 'All Merchants'}
                </span>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border max-h-64 overflow-auto">
                    <div className="p-2 sticky top-0 bg-white border-b">
                        <input
                            type="text"
                            placeholder="Search merchants..."
                            className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <div
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer text-gray-500"
                        onClick={() => handleSelect('')}
                    >
                        All Merchants
                    </div>
                    {filteredMerchants.length > 0 ? (
                        filteredMerchants.map(merchant => (
                            <div
                                key={merchant.id}
                                className={`px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer flex justify-between items-center ${currentMerchantId === merchant.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                    }`}
                                onClick={() => handleSelect(merchant.id)}
                            >
                                {merchant.name}
                                {currentMerchantId === merchant.id && <Check className="h-4 w-4" />}
                            </div>
                        ))
                    ) : (
                        <div className="px-3 py-4 text-center text-sm text-gray-500">
                            No merchants found
                        </div>
                    )}
                </div>
            )}

            {isOpen && (
                <div
                    className="fixed inset-0 z-0 bg-transparent"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    )
}
