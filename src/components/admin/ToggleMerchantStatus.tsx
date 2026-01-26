'use client'

import { useState } from 'react'
import { toggleMerchantStatus } from '@/actions/merchants'

interface ToggleMerchantStatusProps {
    merchantId: string
    isActive: boolean
}

export default function ToggleMerchantStatus({ merchantId, isActive: initialStatus }: ToggleMerchantStatusProps) {
    const [isActive, setIsActive] = useState(initialStatus)
    const [loading, setLoading] = useState(false)

    const handleToggle = async () => {
        setLoading(true)
        const newStatus = !isActive

        // Optimistic update
        setIsActive(newStatus)

        try {
            const result = await toggleMerchantStatus(merchantId, newStatus)
            if (!result.success) {
                // Revert on failure
                setIsActive(!newStatus)
                console.error('Failed to update status:', result.error)
                alert('Status update failed')
            }
        } catch (error) {
            setIsActive(!newStatus)
            console.error('Failed to update status:', error)
            alert('Status update failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleToggle}
            disabled={loading}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${isActive ? 'bg-orange-500' : 'bg-gray-200'
                } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            role="switch"
            aria-checked={isActive}
        >
            <span className="sr-only">Toggle Status</span>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    )
}
