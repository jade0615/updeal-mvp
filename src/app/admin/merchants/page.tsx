import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ExportMerchantsButton } from '@/components/admin/MerchantUtilityButtons'
import { getAllMerchantsStats } from '@/actions/analytics'
import DashboardHUD from '@/components/admin/DashboardHUD'
import SmartFilterBar from '@/components/admin/SmartFilterBar'
import MerchantsTable from '@/components/admin/MerchantsTable'

interface Props {
  searchParams: Promise<{ q?: string; period?: string }>
}

export default async function MerchantsPage({ searchParams }: Props) {
  const { q: searchQuery, period } = await searchParams

  // 1. Fetch Data (Server-Side)
  // Default to 'today' if no period selected
  const currentPeriod = period || 'today';
  const allMerchants: any[] = await getAllMerchantsStats(currentPeriod)

  // 2. Filter Data (Client-Side Logic for Search)
  // Ideally this moves to backend for scale, but for <1000 items, client-side is faster/simpler
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
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Operations Center</h1>
            <p className="text-sm text-gray-500 mt-1">Manage merchants, monitor performance, and optimize conversion.</p>
          </div>
          <div className="flex gap-3">
            <ExportMerchantsButton merchants={merchants || []} />
            <Link
              href="/admin/merchants/new"
              className="bg-black text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-all shadow-sm font-medium flex items-center gap-2"
            >
              + Add Merchant
            </Link>
          </div>
        </div>

        {/* 1. HUD (Heads-Up Display) */}
        <DashboardHUD merchants={merchants} />

        {/* 2. Smart Filter Bar */}
        <SmartFilterBar />

        {/* 3. Interactive Table & Drawer */}
        <MerchantsTable initialMerchants={merchants} />

        {/* Empty State */}
        {(!merchants || merchants.length === 0) && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 mb-2">No merchants found matching your filters.</p>
            <button className="text-blue-600 hover:underline text-sm">Clear all filters</button>
          </div>
        )}

      </div>
    </div>
  )
}
