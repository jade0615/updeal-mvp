import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteMerchantButton from '@/components/admin/DeleteMerchantButton'
import { CopyButton, ExportMerchantsButton } from '@/components/admin/MerchantUtilityButtons'
import ToggleMerchantStatus from '@/components/admin/ToggleMerchantStatus'
import MerchantSearch from '@/components/admin/MerchantSearch'
import { getAllMerchantsStats } from '@/actions/analytics'
import TimeRangeFilter from '@/components/admin/TimeRangeFilter'
import { getNYLastUpdatedMessage } from '@/lib/utils/date'

interface Props {
  searchParams: Promise<{ q?: string; period?: string }>
}

export default async function MerchantsPage({ searchParams }: Props) {
  const { q: searchQuery, period } = await searchParams

  // Fetch stats based on selected period (default 'today')
  // The backend now returns numbers SPECIFIC to this period.
  const currentPeriod = period || 'today';

  // Fetch all merchants with REAL-TIME aggregated stats
  const allMerchants: any[] = await getAllMerchantsStats(currentPeriod)

  let merchants = allMerchants

  // Client-side filtering for search
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase()
    merchants = allMerchants.filter(m =>
      (m.name?.toLowerCase() || '').includes(lowerQ) ||
      (m.slug?.toLowerCase() || '').includes(lowerQ) ||
      (m.internal_id?.toLowerCase() || '').includes(lowerQ) ||
      (m.redeem_pin?.toLowerCase() || '').includes(lowerQ)
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://hiraccoon.com'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">商家管理 dashboard</h1>
              <p className="text-sm text-blue-600 mt-1 font-medium">
                数据更新时间：{getNYLastUpdatedMessage()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <MerchantSearch />
              <ExportMerchantsButton merchants={merchants || []} />
              <Link
                href="/admin/merchants/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center whitespace-nowrap"
              >
                + 新增商家
              </Link>
            </div>
          </div>

          {/* Time Filter Row */}
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
            <span className="text-sm font-medium text-gray-500">统计时间范围:</span>
            <TimeRangeFilter />
            <span className="text-xs text-gray-400 ml-auto">
              数据实时更新 (NY Time)
            </span>
          </div>
        </div>

        {!merchants || merchants.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            {searchQuery ? (
              <>
                <p className="text-gray-500 mb-2">没有找到匹配 "{searchQuery}" 的商家</p>
                <p className="text-sm text-gray-400">尝试使用其他关键词搜索</p>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4">还没有商家，点击上方按钮创建第一个商家</p>
                <Link
                  href="/admin/merchants/new"
                  className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  创建商家
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[240px]">
                    商家名称 (Merchant)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    📊 运营数据 ({currentPeriod.toUpperCase()})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link & Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    {/* Merchant Info Column */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            {merchant.name}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {merchant.slug}
                            </div>
                            {merchant.internal_id && (
                              <div className="text-xs text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded">
                                #{merchant.internal_id}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            PIN: <span className="font-mono text-gray-600 font-medium">{merchant.redeem_pin || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Core Metrics Column (Time-Filtered) */}
                    <td className="px-6 py-4 bg-slate-50/50">
                      <div className="flex flex-col gap-2 min-w-[200px]">
                        {/* Redemptions */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">✅</span>
                            <span className="text-xs font-bold text-gray-500 uppercase w-16">核销</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-orange-600 block">
                              {(merchant.real_stats?.redemptions || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Claims */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">🎟️</span>
                            <span className="text-xs font-medium text-gray-500 w-16">领取</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-orange-600 block">
                              {(merchant.real_stats?.claims || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Views */}
                        <div className="flex items-center justify-between border-t border-gray-100 pt-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-lg">👁️</span>
                            <span className="text-xs font-medium text-gray-500 w-16">浏览</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-medium text-gray-500 block">
                              {(merchant.real_stats?.views || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Rate */}
                        <div className="mt-1 text-right">
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                            核销率: {merchant.real_stats?.redemption_rate}%
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Links Column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-8">C端:</span>
                          <a href={`/${merchant.slug}`} target="_blank" className="text-blue-600 hover:underline text-xs truncate max-w-[100px]">
                            Preview
                          </a>
                          <CopyButton text={`${baseUrl}/${merchant.slug}`} label="Copy" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-8">B端:</span>
                          <a href={`/store-redeem/${merchant.slug}`} target="_blank" className="text-purple-600 hover:underline text-xs truncate max-w-[100px]">
                            Redeem
                          </a>
                          <CopyButton text={`${baseUrl}/store-redeem/${merchant.slug}`} label="Copy" />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ToggleMerchantStatus merchantId={merchant.id} isActive={merchant.is_active} />
                        <span className={`text-xs font-semibold ${merchant.is_active ? 'text-orange-700' : 'text-gray-500'}`}>
                          {merchant.is_active ? '启用' : '禁用'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/admin/merchants/${merchant.id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        编辑
                      </Link>
                      <DeleteMerchantButton merchantId={merchant.id} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
