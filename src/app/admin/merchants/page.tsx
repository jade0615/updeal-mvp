import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import DeleteMerchantButton from '@/components/admin/DeleteMerchantButton'
import { CopyButton, ExportMerchantsButton } from '@/components/admin/MerchantUtilityButtons'
import ToggleMerchantStatus from '@/components/admin/ToggleMerchantStatus'

export default async function MerchantsPage() {
  const supabase = createAdminClient()

  const { data: merchants } = await supabase
    .from('merchants')
    .select('*')
    .order('created_at', { ascending: false })

  // Ideally we get the base URL from env, but client components will use window.location
  // For server-side rendering links, we can use relative paths or env var if needed.
  // Here we pass data to client components.
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://updeal.top' // Fallback for copy text if needed, but client component handles it better with window.location

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">商家管理</h1>
          <div className="flex gap-3">
            <ExportMerchantsButton merchants={merchants || []} />
            <Link
              href="/admin/merchants/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center"
            >
              + 新增商家
            </Link>
          </div>
        </div>

        {!merchants || merchants.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 mb-4">还没有商家，点击上方按钮创建第一个商家</p>
            <Link
              href="/admin/merchants/new"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              创建商家
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    商家名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PIN
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link / Redeem
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
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">
                        {merchant.name}
                      </div>
                      <div className="text-xs text-gray-500 font-mono mt-1">
                        {merchant.slug}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono font-bold text-gray-600 bg-gray-50 px-2 py-1 rounded inline-block">
                        {merchant.redeem_pin || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-12">推广页:</span>
                          <a href={`/${merchant.slug}`} target="_blank" className="text-blue-600 hover:underline text-sm truncate max-w-[150px]">
                            /{merchant.slug}
                          </a>
                          <CopyButton text={`${baseUrl}/${merchant.slug}`} label="复制URL" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-400 w-12">核销页:</span>
                          <a href={`/store-redeem/${merchant.slug}`} target="_blank" className="text-purple-600 hover:underline text-sm truncate max-w-[150px]">
                            /redeem...
                          </a>
                          <CopyButton text={`${baseUrl}/store-redeem/${merchant.slug}`} label="复制URL" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ToggleMerchantStatus merchantId={merchant.id} isActive={merchant.is_active} />
                        <span className={`text-xs font-semibold ${merchant.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                          {merchant.is_active ? '启用' : '禁用'}
                        </span>
                      </div>
                    </td>
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
