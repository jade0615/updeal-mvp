import { getCustomers, CustomerQuery } from '@/actions/customers';
import { createAdminClient } from '@/lib/supabase/admin';
import CustomerExportButton from '@/components/admin/CustomerExportButton';
import SearchableMerchantFilter from '@/components/admin/SearchableMerchantFilter';
import CustomerTable from '@/components/admin/CustomerTable';
import DebouncedInput from '@/components/admin/DebouncedInput';
import { useRouter } from 'next/navigation'; // Not used in server component but imported in client components

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CustomersPage({ searchParams }: Props) {
    const params = await searchParams

    // Parse Query Params
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 50
    const sortField = params.sortField as string
    const sortDir = (params.sortDir as 'asc' | 'desc') || 'desc'
    const search = params.search as string

    // Parse Filters
    const query: CustomerQuery = {
        page,
        limit,
        sortField,
        sortDir,
        search,
        filters: {
            phone: params.phone as string,
            name: params.name as string,
            coupon: params.coupon as string,
            merchantId: params.merchantId as string
        }
    }

    // Fetch customers
    const { customers, success, error, total } = await getCustomers(query);

    // Fetch merchants for filter dropdown
    const supabase = createAdminClient();
    const { data: merchants } = await supabase
        .from('merchants')
        .select('id, name')
        .order('name');

    if (!success) {
        return <div className="p-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Data</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and manage all customer claims ({total} total records)
                        </p>
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    {/* Left: Global Search & Merchant Filter */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                        <DebouncedSearchWrapper defaultValue={search} />
                        <SearchableMerchantFilter merchants={merchants || []} />
                    </div>

                    {/* Right: Export */}
                    <div className="w-full md:w-auto flex justify-end">
                        <CustomerExportButton data={customers || []} />
                    </div>
                </div>

                <CustomerTable
                    data={customers || []}
                    total={total || 0}
                    page={page}
                    limit={limit}
                />

            </div>
        </div>
    );
}

// Client Component Wrapper for Global Search to use router
import GlobalSearchInput from '@/components/admin/GlobalSearchInput';

function DebouncedSearchWrapper({ defaultValue }: { defaultValue?: string }) {
    return <GlobalSearchInput defaultValue={defaultValue} />
}

