'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import ToggleMerchantStatus from '@/components/admin/ToggleMerchantStatus'
import DeleteMerchantButton from '@/components/admin/DeleteMerchantButton'
import { CopyButton } from '@/components/admin/MerchantUtilityButtons'

type MerchantRow = any

export interface MerchantGroup {
  key: string
  items: MerchantRow[]
  totals: {
    views: number
    claims: number
    redemptions: number
  }
}

interface Props {
  merchantGroups: MerchantGroup[]
  baseUrl: string
}

export default function MerchantGroupsTable({ merchantGroups, baseUrl }: Props) {
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({})

  const toggle = (key: string) => {
    setOpenKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const rows = useMemo(() => merchantGroups, [merchantGroups])

  return (
    <tbody className="bg-white divide-y divide-gray-200">
      {rows.map((g) => {
        const merchant = g.items[0]
        const offerCount = g.items.length
        const isOpen = !!openKeys[g.key]

        const groupViews = g.totals.views
        const groupClaims = g.totals.claims
        const groupRedemptions = g.totals.redemptions
        const groupRate = groupClaims > 0 ? ((groupRedemptions / groupClaims) * 100).toFixed(1) : '0.0'

        return (
          <>
            <tr key={g.key} className="hover:bg-gray-50">
              {/* Merchant Info Column */}
              <td className="px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900">
                      {merchant.name}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
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

                  {offerCount > 1 && (
                    <button
                      type="button"
                      onClick={() => toggle(g.key)}
                      className="flex-shrink-0 text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      <span className={`transition-transform ${isOpen ? 'rotate-90' : ''}`}>▶</span>
                      同一家店的更多折扣（{offerCount - 1}）
                    </button>
                  )}
                </div>
              </td>

              {/* Core Metrics Column */}
              <td className="px-6 py-4 bg-slate-50/50">
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">✅</span>
                      <span className="text-xs font-bold text-gray-500 uppercase w-16">核销</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-orange-600 block">
                        {groupRedemptions.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">🎟️</span>
                      <span className="text-xs font-medium text-gray-500 w-16">领取</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-orange-600 block">
                        {groupClaims.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg">👁️</span>
                      <span className="text-xs font-medium text-gray-500 w-16">浏览</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-500 block">
                        {groupViews.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-1 text-right">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      核销率: {groupRate}%
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

            {offerCount > 1 && isOpen && (
              <tr key={`${g.key}__expanded`} className="bg-slate-50">
                <td colSpan={5} className="px-6 py-4">
                  <div className="text-xs font-bold text-slate-500 mb-3">
                    同一家店的折扣列表（{offerCount}）
                  </div>
                  <div className="space-y-2">
                    {g.items.map((o, idx) => {
                      const views = (o.real_stats?.views || 0)
                      const claims = (o.real_stats?.claims || 0)
                      const redemptions = (o.real_stats?.redemptions || 0)
                      const rate = claims > 0 ? ((redemptions / claims) * 100).toFixed(1) : '0.0'

                      return (
                        <div
                          key={o.id}
                          className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-900">
                                {idx === 0 ? '主折扣' : `折扣 ${idx + 1}`}
                              </span>
                              <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                                {o.slug}
                              </span>
                              {o.internal_id && (
                                <span className="text-xs text-purple-600 font-mono bg-purple-50 px-1.5 py-0.5 rounded">
                                  #{o.internal_id}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ✅ {redemptions.toLocaleString()} · 🎟️ {claims.toLocaleString()} · 👁️ {views.toLocaleString()} · 核销率 {rate}%
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            <a href={`/${o.slug}`} target="_blank" className="text-xs text-blue-600 hover:underline">
                              C端 Preview
                            </a>
                            <a href={`/store-redeem/${o.slug}`} target="_blank" className="text-xs text-purple-600 hover:underline">
                              B端 Redeem
                            </a>
                            <Link href={`/admin/merchants/${o.id}/edit`} className="text-xs text-gray-700 hover:text-gray-900">
                              编辑
                            </Link>
                            <div className="flex items-center gap-2">
                              <ToggleMerchantStatus merchantId={o.id} isActive={o.is_active} />
                              <span className={`text-xs font-semibold ${o.is_active ? 'text-orange-700' : 'text-gray-500'}`}>
                                {o.is_active ? '启用' : '禁用'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </td>
              </tr>
            )}
          </>
        )
      })}
    </tbody>
  )
}

