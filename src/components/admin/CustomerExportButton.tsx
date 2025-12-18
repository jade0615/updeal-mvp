'use client';

import { Download } from 'lucide-react';
import { CustomerData } from '@/actions/customers';

interface Props {
    data: CustomerData[];
}

export default function CustomerExportButton({ data }: Props) {
    const handleExport = () => {
        // CSV Header
        const headers = ['Phone', 'Name', 'Merchant', 'Coupon Code', 'Claimed At'];

        // CSV Rows
        const rows = data.map(item => [
            item.phone,
            item.name || '',
            item.merchant_name,
            item.coupon_code,
            item.claimed_at
        ]);

        // Construct CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Create Blob and Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700"
        >
            <Download className="h-4 w-4" />
            Export CSV
        </button>
    );
}
