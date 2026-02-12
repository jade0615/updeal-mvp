
'use client'

import React, { useState, useEffect } from 'react'
import { Check, Clipboard, Download, X, User, Heart, Share2, Info, ArrowRight } from 'lucide-react'
import html2canvas from 'html2canvas'
import { toast } from 'sonner' // Using sonner for toasts as seen in package.json
import Image from 'next/image'
import Link from 'next/link'

// Color theme based on screenshots (Weee! Blue)
const THEME = {
    primary: '#00B6F0', // Cyan Blue
    primaryDark: '#009ACD',
    primaryLight: '#E0F7FE',
    text: '#1F2937',
    textMuted: '#6B7280',
    white: '#FFFFFF',
    bg: '#F3F4F6'
}

interface Merchant {
    id: string
    name: string
    slug: string
    logo_url: string | null
    content: any
}

interface Props {
    merchant: Merchant
    userId?: string
    referralCode?: string
}

export default function ReferralDashboardTemplate({ merchant, userId = 'mock-user-id', referralCode = 'REF-1234' }: Props) {
    const [showShareModal, setShowShareModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [loadingImage, setLoadingImage] = useState(false)

    // Construct the referral link
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const referralLink = `${origin}/${merchant.slug}?ref=${referralCode}&utm_source=copyLink`

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink)
            setCopied(true)
            toast.success('Link copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error('Failed to copy link')
        }
    }

    const handleSaveImage = async () => {
        setLoadingImage(true)
        try {
            const element = document.getElementById('share-poster')
            if (element) {
                const canvas = await html2canvas(element, {
                    backgroundColor: '#FFFFFF',
                    scale: 2, // higher quality
                    useCORS: true, // for images
                })
                const dataUrl = canvas.toDataURL('image/png')

                // Trigger download
                const link = document.createElement('a')
                link.download = `invite-${merchant.slug}.png`
                link.href = dataUrl
                link.click()
                toast.success('Image saved!')
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to save image')
        } finally {
            setLoadingImage(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans pb-20 relative overflow-hidden">
            {/* 1. Header Section (Blue Background) */}
            <div
                className="w-full h-[280px] relative px-6 pt-8 text-white flex flex-col justify-start"
                style={{ background: `linear-gradient(180deg, ${THEME.primaryLight} 0%, ${THEME.primary} 100%)` }}
            >
                {/* Back Button Placeholder (Mock) */}
                <div className="absolute top-4 left-4" onClick={() => window.history.back()}>
                    <ArrowRight className="h-6 w-6 transform rotate-180 text-gray-600 cursor-pointer" />
                </div>

                <div className="flex justify-between items-start mt-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 leading-tight">
                            Invite Friends<br />
                            Get <span className="text-red-500">$20</span>
                        </h1>
                        {/* Hidden on mobile possibly, or simplified */}
                    </div>
                    {/* The Icon Graphic (User + Heart) from screenshot */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 relative">
                        <div className="relative">
                            <User className="h-16 w-16 text-blue-600 fill-current" />
                            <Heart className="h-8 w-8 text-red-500 fill-current absolute -bottom-1 -right-1 border-2 border-white rounded-full bg-white box-content p-1" />
                        </div>
                    </div>
                </div>

                {/* Reward Status Row (Mock Data matching Screenshot) */}
                <div className="mt-auto mb-16 flex justify-between items-end border-b border-white/20 pb-2">
                    <span className="text-gray-600 text-sm">Earned Credits</span>
                    <span className="text-3xl font-bold text-red-500">$0</span>
                </div>

            </div>

            {/* 2. Main Content Card (Floating) */}
            <div className="relative px-4 -mt-12 z-10 w-full max-w-md mx-auto">

                {/* Share Button (Big Blue/Cyan) */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center">
                    <button
                        onClick={() => setShowShareModal(true)}
                        className="w-full py-3.5 rounded-full font-bold text-lg text-white shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
                        style={{ backgroundColor: THEME.primary }}
                    >
                        <Share2 className="h-5 w-5" />
                        Share Link
                    </button>

                    {/* Info Grid (Steps) */}
                    <div className="mt-8 grid grid-cols-1 gap-4">
                        <StepItem
                            icon={<div className="bg-cyan-100 p-2 rounded-full text-cyan-600"><Share2 size={20} /></div>}
                            title="Invite a friend, get $20 credit"
                            desc="When your friend registers via your link and completes their first order within 14 days, you get $10 credit. Complete second order within 30 days, get another $10."
                        />
                        <StepItem
                            icon={<div className="bg-cyan-100 p-2 rounded-full text-cyan-600"><User size={20} /></div>}
                            title="Friend gets $20 Off"
                            desc="Invited friend registers and verifies account. Get $10 off first two orders each."
                        />
                    </div>
                </div>

                {/* 3. Invited List (Empty State) */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        Invited Friends <span className="text-gray-400 font-normal body-sm">(0)</span>
                    </h3>

                    <div className="py-8 text-center flex flex-col items-center justify-center text-gray-400">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                            <User className="h-8 w-8 text-gray-300" />
                        </div>
                        <p className="text-sm">You haven't invited any new users this month</p>
                    </div>
                </div>

                {/* 4. Rules Section */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                    <h3 className="font-bold text-gray-800 mb-4">Rules & Details</h3>
                    <ul className="text-xs text-gray-500 space-y-2 list-decimal list-inside">
                        <li>Inviter and Invitee must meet conditions to earn rewards.</li>
                        <li>Invitee must be a new user (never created account before).</li>
                        <li>Invitee must register via the shared link.</li>
                        <li>Invitee must verify phone number upon registration.</li>
                        <li>Reward ($20) is split: $10 after 1st order, $10 after 2nd order.</li>
                        <li>Orders must be delivered successfully to qualify.</li>
                        <li>Points can be used directly for payment.</li>
                        <li>Same delivery address cannot have two invited accounts.</li>
                        <li>Merchant reserves final right of interpretation.</li>
                    </ul>
                    <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
                        <div className="flex justify-center gap-3 text-xs text-gray-400 decoration-gray-200 underline-offset-4">
                            <Link
                                href={`/privacy-policy?slug=${merchant.slug}`}
                                className="hover:text-cyan-600 transition-colors underline"
                            >
                                Privacy Policy
                            </Link>
                            <span>|</span>
                            <Link
                                href={`/terms-of-service?slug=${merchant.slug}`}
                                className="hover:text-cyan-600 transition-colors underline"
                            >
                                Terms of Service
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal / Dialog */}
            {showShareModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setShowShareModal(false)}>
                    <div className="bg-white w-full max-w-sm rounded-[24px] overflow-hidden" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="relative p-4 text-center border-b border-gray-100">
                            <h3 className="font-bold text-lg text-gray-800">Share</h3>
                            <button
                                onClick={() => setShowShareModal(false)}
                                className="absolute top-4 left-4 p-1 hover:bg-gray-100 rounded-full"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                            {/* Preview Text */}
                            <div className="mb-6">
                                <p className="text-gray-800 font-medium text-lg mb-1">New User $20 Off!</p>
                                <p className="text-gray-500 text-sm">Come shop at {merchant.name}, super popular!</p>
                            </div>

                            {/* Language Pills (Mock) */}
                            <div className="flex gap-2 overflow-x-auto mb-6 pb-2 no-scrollbar">
                                {['Simplified', 'Traditional', 'English', 'Korean', 'Japanese', 'Thai'].map((lang, i) => (
                                    <span
                                        key={lang}
                                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${i === 0 ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-white text-gray-600 border-gray-200'}`}
                                    >
                                        {lang}
                                    </span>
                                ))}
                            </div>

                            <p className="text-red-500 font-bold mb-6 text-sm">
                                Invite Friends, Get $20
                            </p>

                            {/* Action Buttons Row */}
                            <div className="flex gap-4">
                                {/* Copy Link Button */}
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <button
                                        onClick={handleCopyLink}
                                        className="w-14 h-14 rounded-full flex items-center justify-center bg-pink-600 text-white shadow-md active:scale-95 transition-transform"
                                    >
                                        {copied ? <Check size={24} /> : <div className="font-bold text-xl">🔗</div>}
                                        {/* Using emoji or icon for the 'Link' visual */}
                                    </button>
                                    <span className="text-xs text-gray-500">Copy Link</span>
                                </div>

                                {/* Save Image Button */}
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <button
                                        onClick={handleSaveImage}
                                        disabled={loadingImage}
                                        className="w-14 h-14 rounded-full flex items-center justify-center bg-cyan-500 text-white shadow-md active:scale-95 transition-transform disabled:opacity-70"
                                    >
                                        {loadingImage ? (
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                                        ) : (
                                            <div className="font-bold text-xl">🖼️</div>
                                        )}
                                    </button>
                                    <span className="text-xs text-gray-500">Save Image</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Hidden Poster Element for Screenshot Generation */}
            <div id="share-poster" className="fixed top-0 left-0 w-[375px] bg-white pointer-events-none opacity-0 z-[-1]">
                <div className="p-8 bg-gradient-to-b from-cyan-50 to-white min-h-[600px] flex flex-col items-center text-center">
                    <div className="bg-white p-4 rounded-xl shadow-sm mb-6 w-24 h-24 flex items-center justify-center">
                        {/* Merchant Logo */}
                        {merchant.logo_url ? (
                            <img src={merchant.logo_url} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <div className="text-2xl font-bold text-cyan-500">{merchant.name.substring(0, 2)}</div>
                        )}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">{merchant.name}</h2>
                    <p className="text-lg text-gray-600 mb-8">Invite you to join & get <span className="text-red-500">$20 Off</span></p>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-xl mb-10 min-h-[200px] flex flex-col items-center justify-center border-2 border-dashed border-cyan-200 relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-white text-[10px] font-black px-5 py-1.5 rounded-full uppercase tracking-[0.3em] whitespace-nowrap shadow-sm">
                            Referral Code
                        </div>

                        <div className="py-6">
                            <div className="text-5xl font-black text-cyan-600 tracking-[0.1em] leading-none font-mono">{referralCode}</div>
                        </div>

                        <div className="mt-4 pt-6 border-t border-gray-100 w-full text-center">
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
                                SHARE THIS CODE<br />
                                WITH YOUR FRIENDS
                            </p>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Enjoy your rewards!</p>
                    <div className="mt-8 text-xs text-gray-300">Powered by hiraccoon.com</div>
                </div>
            </div>

        </div>
    )
}

function StepItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex gap-4 text-left">
            <div className="flex-shrink-0 mt-1">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-800 text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    )
}
