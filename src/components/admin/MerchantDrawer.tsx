'use client'

import { X, ExternalLink, Copy, Check } from 'lucide-react'
import { useState } from 'react';
import ToggleMerchantStatus from './ToggleMerchantStatus';

interface Merchant {
    id: string
    name: string
    slug: string
    is_active: boolean
    internal_id?: string | null
    redeem_pin?: string | null
    real_stats?: {
        views: number
        claims: number
        redemptions: number
        redemption_rate: string
    }
}

interface Props {
    merchant: Merchant | null
    onClose: () => void
}

export default function MerchantDrawer({ merchant, onClose }: Props) {
    const [copied, setCopied] = useState(false);

    if (!merchant) return null;

    const copyLink = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hiraccoon.com';

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer Panel */}
            <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out border-l border-gray-100 flex flex-col">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{merchant.name}</h2>
                        <span className="text-xs font-mono text-gray-400">{merchant.id}</span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* 1. Quick Config */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Configuration</h3>
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">Status</span>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs ${merchant.is_active ? 'text-green-600' : 'text-gray-400'}`}>
                                        {merchant.is_active ? 'Live' : 'Disabled'}
                                    </span>
                                    <ToggleMerchantStatus merchantId={merchant.id} isActive={merchant.is_active} />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. Performance Snapshot */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Performance Snapshot</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                <div className="text-xs text-green-600 font-medium mb-1">Total Redemptions</div>
                                <div className="text-2xl font-bold text-green-700">{merchant.real_stats?.redemptions}</div>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                <div className="text-xs text-blue-600 font-medium mb-1">Total Views</div>
                                <div className="text-2xl font-bold text-blue-700">{merchant.real_stats?.views}</div>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 col-span-2">
                                <div className="text-xs text-orange-600 font-medium mb-1">Conversion Rate</div>
                                <div className="flex items-end gap-2">
                                    <div className="text-2xl font-bold text-orange-700">{merchant.real_stats?.redemption_rate}%</div>
                                    <div className="h-2 flex-1 bg-orange-200 rounded-full mb-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-orange-500 rounded-full"
                                            style={{ width: `${Math.min(Number(merchant.real_stats?.redemption_rate), 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. Links */}
                    <section>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Links</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">C</div>
                                    <div className="text-sm font-medium text-gray-700">Customer Page</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`/${merchant.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button onClick={() => copyLink(`${baseUrl}/${merchant.slug}`)} className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-blue-600">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg group hover:border-purple-300 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 font-bold text-xs">B</div>
                                    <div className="text-sm font-medium text-gray-700">Redemption Portal</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <a href={`/store-redeem/${merchant.slug}`} target="_blank" className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-purple-600">
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button onClick={() => copyLink(`${baseUrl}/store-redeem/${merchant.slug}`)} className="p-2 hover:bg-gray-100 rounded-md text-gray-400 hover:text-purple-600">
                                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">View Full History</button>
                    <button className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800">Edit Details</button>
                </div>
            </div>
        </>
    )
}
