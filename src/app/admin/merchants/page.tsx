import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ExportMerchantsButton } from '@/components/admin/MerchantUtilityButtons'
import { getAllMerchantsStats } from '@/actions/analytics'
import DashboardHUD from '@/components/admin/DashboardHUD'
import SmartFilterBar from '@/components/admin/SmartFilterBar'
import MerchantsTable from '@/components/admin/MerchantsTable'
import StoreMonitor from '@/components/admin/StoreMonitor'
import { LayoutGrid, List } from 'lucide-react'

interface Props {
  searchParams: Promise<{ q?: string; period?: string }>
}

export default async function MerchantsPage({ searchParams }: Props) {
  const { q: searchQuery, period, view } = await searchParams

  // 1. Fetch Data (Server-Side)
  // Default to 'today' if no period selected
  const currentPeriod = period || 'today';
  const currentView = view || 'grid'; // Default to monitor/grid view
  const allMerchants: any[] = await getAllMerchantsStats(currentPeriod)

  // 2. Filter Data (Client-Side Logic for Search)
  let merchants = allMerchants
  if (searchQuery) {
    const lowerQ = searchQuery.toLowerCase()
    merchants = allMerchants.filter(m =>
      (m.name?.toLowerCase() || '').includes(lowerQ) ||
      (m.slug?.toLowerCase() || '').includes(lowerQ) ||
      (m.internal_id?.toLowerCase() || '').includes(lowerQ) ||
      (m.redeem_pin?.toLowerCase() || '').includes(lowerQ)
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-2xl">🏢</span>
              商家管理中心 (Operations)
            </h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">管理落地页、监控实时核销数据并导出客户名单。</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm mr-2">
              <Link
                href={`?view=grid&period=${currentPeriod}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={`p-2 rounded-lg transition-all ${currentView === 'grid' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </Link>
              <Link
                href={`?view=list&period=${currentPeriod}${searchQuery ? `&q=${searchQuery}` : ''}`}
                className={`p-2 rounded-lg transition-all ${currentView === 'list' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <List className="w-5 h-5" />
              </Link>
            </div>
            <ExportMerchantsButton merchants={merchants || []} />
            <Link
              href="/admin/merchants/new"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 font-bold flex items-center gap-2"
            >
              + Add Merchant
            </Link>
          </div>
        </div>

        {/* 1. HUD (Heads-Up Display) */}
        <DashboardHUD merchants={merchants} />

        {/* 2. Smart Filter Bar */}
        <div className="mt-10">
          <SmartFilterBar />
        </div>

        {/* 3. Main Content View */}
        <div className="mt-8">
          {currentView === 'grid' ? (
            <StoreMonitor merchants={merchants} />
          ) : (
            <MerchantsTable initialMerchants={merchants} />
          )}
        </div>

        {/* Empty State */}
        {(!merchants || merchants.length === 0) && (
          <div className="mt-12 text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium mb-4">没有找到匹配的商家</p>
            <Link href="/admin/merchants" className="text-blue-600 font-bold hover:underline">清除搜索条件</Link>
          </div>
        )}

      </div>
    </div>
  )
}

