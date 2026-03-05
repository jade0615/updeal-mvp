import { getReferralChains } from '@/actions/referrals'
import { getMerchantCustomerStats } from '@/actions/customers'
import ReferralTable from '@/components/admin/ReferralTable'
import { Suspense } from 'react'
import { GitBranch } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ReferralsPage({ searchParams }: Props) {
    const params = await searchParams
    const merchantId = params.merchantId as string | undefined

    const [referralResult, merchantStats] = await Promise.all([
        getReferralChains(merchantId),
        getMerchantCustomerStats()
    ])

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* 页面标题 */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <GitBranch className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">推荐记录</h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                查看谁分享了优惠 → 让谁领取了优惠
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
                        <span className="text-purple-600 text-2xl font-bold">{referralResult.total}</span>
                        <span className="text-purple-500 text-sm font-medium">条推荐记录</span>
                    </div>
                </div>

                {/* 商家筛选 */}
                <div className="mb-6 flex flex-wrap gap-2">
                    <a
                        href="/admin/referrals"
                        className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${!merchantId
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                            }`}
                    >
                        全部商家
                    </a>
                    {merchantStats.map((m) => (
                        <a
                            key={m.id}
                            href={`/admin/referrals?merchantId=${m.id}`}
                            className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${merchantId === m.id
                                    ? 'bg-purple-600 text-white border-purple-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-purple-300'
                                }`}
                        >
                            {m.name}
                        </a>
                    ))}
                </div>

                {/* 表格 */}
                <Suspense fallback={<div className="h-64 bg-gray-100 rounded-xl animate-pulse" />}>
                    {referralResult.success ? (
                        <ReferralTable records={referralResult.records} />
                    ) : (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-600">
                            加载失败：{referralResult.error}
                        </div>
                    )}
                </Suspense>
            </div>
        </div>
    )
}
