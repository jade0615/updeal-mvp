import { getCustomers, getMerchantCustomerStats, CustomerQuery } from '@/actions/customers';
import CustomerExportButton from '@/components/admin/CustomerExportButton';
import MerchantStatsCards from '@/components/admin/MerchantStatsCards';
import CustomerTableNew from '@/components/admin/CustomerTableNew';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CustomersPage({ searchParams }: Props) {
    const params = await searchParams

    // Parse Query Params
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 50
    const search = params.search as string
    const merchantId = params.merchantId as string

    // Build query
    const query: CustomerQuery = {
        page,
        limit,
        sortDir: 'desc',
        search,
        filters: {
            merchantId
        }
    }

    // Fetch data in parallel
    const [customersResult, merchantStats] = await Promise.all([
        getCustomers(query),
        getMerchantCustomerStats()
    ])

    const { customers, success, error, total } = customersResult;

    // Get selected merchant name
    const selectedMerchant = merchantId
        ? merchantStats.find(m => m.id === merchantId)
        : null

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
                {/* 页面标题 */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">客户数据</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            查看和管理所有客户信息，按商家分类查看
                        </p>
                    </div>
                    <CustomerExportButton data={customers || []} />
                </div>

                {/* 商家统计卡片 */}
                <div className="mb-6">
                    <Suspense fallback={<div className="h-32 bg-gray-100 rounded-xl animate-pulse" />}>
                        <MerchantStatsCards
                            merchants={merchantStats}
                            selectedMerchantId={merchantId}
                        />
                    </Suspense>
                </div>

                {/* 客户表格 */}
                <CustomerTableNew
                    data={customers || []}
                    total={total || 0}
                    page={page}
                    limit={limit}
                    selectedMerchantName={selectedMerchant?.name}
                />
            </div>
        </div>
    );
}
