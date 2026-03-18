import Link from 'next/link'
import DeleteMerchantButton from '@/components/admin/DeleteMerchantButton'
import { CopyButton, ExportMerchantsButton } from '@/components/admin/MerchantUtilityButtons'
import ToggleMerchantStatus from '@/components/admin/ToggleMerchantStatus'
import MerchantSearch from '@/components/admin/MerchantSearch'
import { getAllMerchantsStats } from '@/actions/analytics'
import TimeRangeFilter from '@/components/admin/TimeRangeFilter'
import { getNYLastUpdatedMessage } from '@/lib/utils/date'
import MerchantGroupsTable from '@/components/admin/MerchantGroupsTable'

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

  type MerchantRow = any

  const normalizeAddress = (addr?: string | null) => {
    if (!addr) return null
    const s = String(addr).toLowerCase().trim()
    if (!s) return null
    // normalize punctuation/spacing for stable grouping
    return s
      .replace(/\s+/g, ' ')
      .replace(/[.,#]/g, '')
      .trim()
  }

  const groupKeyOf = (m: MerchantRow) => {
    // Group priority:
    // 1) internal_id (strongest)
    // 2) fullAddress (same store, multiple offers)
    // Fallback to id to avoid accidental merges.
    const internalId = m.internal_id && String(m.internal_id).trim()
    if (internalId) return `internal:${internalId}`
    const addr = normalizeAddress(m.content?.address?.fullAddress)
    if (addr) return `addr:${addr}`
    return `id:${m.id}`
  }

  const grouped = new Map<string, MerchantRow[]>()
  for (const m of merchants) {
    const key = groupKeyOf(m)
    const list = grouped.get(key) || []
    list.push(m)
    grouped.set(key, list)
  }

  const merchantGroups = Array.from(grouped.entries())
    .map(([key, items]) => ({
      key,
      items: items.sort((a, b) => String(a.slug || '').localeCompare(String(b.slug || ''))),
      totals: {
        views: items.reduce((acc, m) => acc + (m.real_stats?.views || 0), 0),
        claims: items.reduce((acc, m) => acc + (m.real_stats?.claims || 0), 0),
        redemptions: items.reduce((acc, m) => acc + (m.real_stats?.redemptions || 0), 0),
      },
    }))
    .sort((a, b) => {
      // Default ordering: highest redemptions first (within selected period)
      const diff = (b.totals.redemptions || 0) - (a.totals.redemptions || 0)
      if (diff !== 0) return diff
      // Tie-breaker: name asc
      const aName = String(a.items[0]?.name || '')
      const bName = String(b.items[0]?.name || '')
      return aName.localeCompare(bName)
    })

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
              <MerchantGroupsTable merchantGroups={merchantGroups} baseUrl={baseUrl} />
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
