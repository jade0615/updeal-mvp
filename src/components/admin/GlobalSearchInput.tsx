'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import DebouncedInput from '@/components/admin/DebouncedInput'

export default function GlobalSearchInput({ defaultValue }: { defaultValue?: string }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = (val: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (val) {
            params.set('search', val)
        } else {
            params.delete('search')
        }
        params.set('page', '1') // Reset page
        router.push(`?${params.toString()}`)
    }

    return (
        <div className="w-full md:w-64">
            <DebouncedInput
                value={defaultValue || ''}
                onChange={handleSearch}
                placeholder="Search customers..."
            />
        </div>
    )
}
