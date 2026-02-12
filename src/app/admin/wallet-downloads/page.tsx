import { getWalletDownloads, WalletDownloadQuery } from '@/actions/wallet-downloads';
import { getMerchantCustomerStats } from '@/actions/customers';
import WalletDownloadsTable from '@/components/admin/WalletDownloadsTable';
import MerchantStatsCards from '@/components/admin/MerchantStatsCards';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WalletDownloadsPage({ searchParams }: Props) {
    const params = await searchParams

    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 50
    const search = params.search as string
    const merchantSlug = params.merchantSlug as string
    const addedToWalletRaw = params.addedToWallet as string

    let addedToWallet: boolean | null = null
    if (addedToWalletRaw === 'true') addedToWallet = true
    if (addedToWalletRaw === 'false') addedToWallet = false

    // For the filter cards, we need to map slugs to IDs if we use MerchantStatsCards
    // or just let it be. MerchantStatsCards uses merchant.id.
    // wallet_downloads table uses merchant_slug.
    // Let's fetch merchants to provide a way to filter.
    const [downloadsResult, merchantStats] = await Promise.all([
        getWalletDownloads({ page, limit, search, merchantSlug, addedToWallet }),
        getMerchantCustomerStats()
    ])

    const { downloads, total, uniqueMerchantSlugs, success, error } = downloadsResult;

    if (!success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-red-600 bg-red-50 px-6 py-4 rounded-lg">
                    Error: {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Apple Wallet 下载追踪</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        监控客户将优惠券添加到 Apple Wallet 的实时情况
                    </p>
                </div>

                {/* Optional: Add merchant cards here if beneficial, 
                    but we might need to adjust them to use slug if we want to filter by slug.
                    For now, I'll focus on the table as requested. */}

                <Suspense fallback={<div className="h-64 bg-white rounded-xl shadow-sm border border-gray-200 animate-pulse" />}>
                    <WalletDownloadsTable
                        data={downloads || []}
                        total={total || 0}
                        page={page}
                        limit={limit}
                        merchantSlugs={uniqueMerchantSlugs || []}
                    />
                </Suspense>
            </div>
        </div>
    );
}
