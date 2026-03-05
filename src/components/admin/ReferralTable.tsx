'use client'

import { ReferralRecord } from '@/actions/referrals'
import { ArrowRight, User, Phone, Mail, Tag, Calendar, GitBranch } from 'lucide-react'

interface Props {
    records: ReferralRecord[]
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleString('zh-CN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function ReferralTable({ records }: Props) {
    if (records.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">暂无推荐记录</p>
                <p className="text-sm text-gray-400 mt-1">当客户通过分享链接领取优惠后，记录会显示在这里</p>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {records.map((record) => (
                <div
                    key={record.invitee_coupon_id}
                    className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-0">

                        {/* 推荐人 (A) */}
                        <div className="p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-purple-500 bg-purple-50 px-2.5 py-1 rounded-full">
                                    📤 分享者
                                </span>
                                {!record.referrer_phone ? (
                                    <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">用户数据待核对</span>
                                ) : null}
                            </div>

                            {record.referrer_phone ? (
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="font-semibold text-gray-800">
                                            {record.referrer_name || '姓名未填'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="font-mono text-sm text-gray-600">{record.referrer_phone}</span>
                                    </div>
                                    {record.referrer_email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 truncate max-w-[200px]">{record.referrer_email}</span>
                                        </div>
                                    )}
                                    {record.referrer_coupon_code && (
                                        <div className="flex items-center gap-2">
                                            <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                                                {record.referrer_coupon_code}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                        <Tag className="w-4 h-4 text-purple-400 flex-shrink-0" />
                                        <span className="font-mono text-sm font-bold text-purple-700">{record.referral_code}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 ml-6">推荐码对应用户未找到</p>
                                </div>
                            )}
                        </div>

                        {/* 箭头 */}
                        <div className="flex items-center justify-center px-2 py-4 md:py-0">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                                    <ArrowRight className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">分享领取</span>
                            </div>
                        </div>

                        {/* 被推荐人 (B) */}
                        <div className="p-5 border-t md:border-t-0 md:border-l border-gray-100 bg-green-50/40">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-green-600 bg-green-100 px-2.5 py-1 rounded-full">
                                    🎁 领取者
                                </span>
                                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {record.invitee_merchant_name}
                                </span>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-semibold text-gray-800">
                                        {record.invitee_name || '姓名未填'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-mono text-sm text-gray-600">{record.invitee_phone}</span>
                                </div>
                                {record.invitee_email && (
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                        <span className="text-sm text-gray-600 truncate max-w-[200px]">{record.invitee_email}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-mono text-xs bg-white border border-green-200 px-2 py-0.5 rounded text-green-700 font-medium">
                                        {record.invitee_coupon_code}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    <span className="text-xs text-gray-500">{formatDate(record.invitee_claimed_at)}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            ))}
        </div>
    )
}
