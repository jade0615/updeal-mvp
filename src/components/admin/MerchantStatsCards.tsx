'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Store, Users, TrendingUp } from 'lucide-react'

interface MerchantStats {
  id: string
  name: string
  internal_id: string | null
  customer_count: number
}

interface Props {
  merchants: MerchantStats[]
  selectedMerchantId?: string
}

export default function MerchantStatsCards({ merchants, selectedMerchantId }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSelectMerchant = (merchantId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (merchantId) {
      params.set('merchantId', merchantId)
    } else {
      params.delete('merchantId')
    }
    params.set('page', '1')
    router.push(`?${params.toString()}`)
  }

  const totalCustomers = merchants.reduce((sum, m) => sum + m.customer_count, 0)

  return (
    <div className="space-y-4">
      {/* 总览卡片 */}
      <div
        onClick={() => handleSelectMerchant(null)}
        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
          !selectedMerchantId
            ? 'border-purple-500 bg-purple-50'
            : 'border-gray-200 bg-white hover:border-gray-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${!selectedMerchantId ? 'bg-purple-500' : 'bg-gray-100'}`}>
              <Users className={`h-5 w-5 ${!selectedMerchantId ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <div>
              <div className="text-sm text-gray-500">全部商家</div>
              <div className="font-semibold text-gray-900">所有客户数据</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">{totalCustomers}</div>
            <div className="text-xs text-gray-500">位客户</div>
          </div>
        </div>
      </div>

      {/* 各商家卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {merchants.map((merchant) => (
          <div
            key={merchant.id}
            onClick={() => handleSelectMerchant(merchant.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedMerchantId === merchant.id
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Store className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  {merchant.internal_id && (
                    <span className="text-xs font-mono bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      {merchant.internal_id}
                    </span>
                  )}
                </div>
                <div className="font-medium text-gray-900 truncate" title={merchant.name}>
                  {merchant.name}
                </div>
              </div>
              <div className="text-right ml-3">
                <div className={`text-xl font-bold ${
                  selectedMerchantId === merchant.id ? 'text-purple-600' : 'text-gray-700'
                }`}>
                  {merchant.customer_count}
                </div>
                <div className="text-xs text-gray-500">客户</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
