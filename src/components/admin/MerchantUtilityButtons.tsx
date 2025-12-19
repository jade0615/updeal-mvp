'use client'

import { useState } from 'react'

interface CopyButtonProps {
    text: string
    label?: string
}

export function CopyButton({ text, label }: CopyButtonProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy!', err)
            // Fallback
        }
    }

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${copied
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            title={text}
        >
            {copied ? (
                <>
                    <span>✓</span>
                    <span>已复制</span>
                </>
            ) : (
                <>
                    <span className="text-base">📋</span>
                    <span>{label || '复制'}</span>
                </>
            )}
        </button>
    )
}

interface ExportMerchantsButtonProps {
    merchants: any[]
}

export function ExportMerchantsButton({ merchants }: ExportMerchantsButtonProps) {
    const handleExport = () => {
        if (!merchants || merchants.length === 0) return

        // Build CSV Content
        const headers = ['Merchant Name,Slug,Phone,PIN,Landing Page URL,Redemption URL,Status,Created At']

        // Get Base URL from window since we are on client
        const baseUrl = window.location.origin

        const rows = merchants.map(m => {
            const landingUrl = `${baseUrl}/${m.slug}`
            const redeemUrl = `${baseUrl}/store-redeem/${m.slug}`

            // Escape CSV fields
            const escape = (str: string) => `"${(str || '').replace(/"/g, '""')}"`

            return [
                escape(m.name),
                escape(m.slug),
                escape(m.phone),
                escape(m.redeem_pin),
                escape(landingUrl),
                escape(redeemUrl),
                escape(m.is_active ? 'Active' : 'Inactive'),
                escape(new Date(m.created_at).toLocaleDateString())
            ].join(',')
        })

        const csvContent = headers.concat(rows).join('\n')

        // Create Download Link
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `updeal_merchants_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <button
            onClick={handleExport}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors flex items-center gap-2"
        >
            <span>📊</span>
            导出商家链接
        </button>
    )
}
