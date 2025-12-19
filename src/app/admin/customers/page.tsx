import { getCustomers } from '@/actions/customers';
import { createAdminClient } from '@/lib/supabase/admin';
import CustomerExportButton from '@/components/admin/CustomerExportButton';
import MerchantFilter from '@/components/admin/MerchantFilter';

export const dynamic = 'force-dynamic';

interface Props {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function CustomersPage({ searchParams }: Props) {
    const minParams = await searchParams
    const merchantId = minParams.merchant_id as string | undefined;

    // Fetch customers with filter
    const { customers, success, error } = await getCustomers(1000, 0, merchantId);

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
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Customer Data</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            View and export customer information from coupon claims.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <MerchantFilter merchants={merchants || []} />
                        <CustomerExportButton data={customers || []} />
                    </div>
                </div>

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Phone
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Name
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Merchant
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Coupon
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                    Claimed At
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {customers && customers.length > 0 ? (
                                customers.map((customer) => (
                                    <tr key={customer.id} className="hover:bg-gray-50">
                                        <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900">
                                            {customer.phone}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {customer.name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                            {customer.merchant_name}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-mono text-sm text-gray-500">
                                            {customer.coupon_code}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                            {customer.claimed_at}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                        No customer data found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-right text-xs text-gray-400">
                    Showing latest {customers?.length || 0} records
                </div>
            </div>
        </div>
    );
}
