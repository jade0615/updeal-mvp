
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Merchant Portal - UpDeal',
    description: 'Merchant management dashboard',
}

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
    )
}
