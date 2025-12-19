'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface Merchant {
    id: string;
    name: string;
}

interface Props {
    merchants: Merchant[];
}

export default function MerchantFilter({ merchants }: Props) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMerchantId = searchParams.get('merchant_id') || '';

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (value) {
            params.set('merchant_id', value);
        } else {
            params.delete('merchant_id');
        }

        router.push(`?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <label htmlFor="merchant-filter" className="text-sm font-medium text-gray-700">
                Filter by:
            </label>
            <select
                id="merchant-filter"
                value={currentMerchantId}
                onChange={handleChange}
                className="block rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
                <option value="">All Merchants</option>
                {merchants.map((merchant) => (
                    <option key={merchant.id} value={merchant.id}>
                        {merchant.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
