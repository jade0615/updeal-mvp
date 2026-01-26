import { getAllMerchantsStats } from '@/actions/analytics'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const merchants = await getAllMerchantsStats()

  // Calculate total stats
  const totalStats = merchants.reduce(
    (acc, merchant) => {
      const stats = merchant.landing_page_stats?.[0]
      return {
        pageViews: acc.pageViews + (stats?.total_page_views || 0),
        formSubmits: acc.formSubmits + (stats?.total_form_submits || 0),
        couponClaims: acc.couponClaims + (stats?.total_coupon_claims || 0),
      }
    },
    { pageViews: 0, formSubmits: 0, couponClaims: 0 }
  )

  const avgConversionRate =
    totalStats.pageViews > 0
      ? ((totalStats.couponClaims / totalStats.pageViews) * 100).toFixed(2)
      : '0.00'

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/admin" className="text-xl font-bold text-gray-900">
                UpDeal
              </Link>
              <Link href="/admin/merchants" className="text-gray-700 hover:text-gray-900">
                商家管理
              </Link>
              <Link href="/admin/analytics" className="text-blue-600 font-medium">
                数据分析
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">数据分析</h1>
          <p className="text-gray-600">实时追踪所有商家的转化数据</p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">总页面访问</p>
                <p className="text-3xl font-bold text-blue-600">
                  {totalStats.pageViews.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👁️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">总表单提交</p>
                <p className="text-3xl font-bold text-orange-600">
                  {totalStats.formSubmits.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100/80 rounded-full flex items-center justify-center">
                <span className="text-2xl">📝</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">总优惠券领取</p>
                <p className="text-3xl font-bold text-purple-600">
                  {totalStats.couponClaims.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🎟️</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">平均转化率</p>
                <p className="text-3xl font-bold text-orange-600">{avgConversionRate}%</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📈</span>
              </div>
            </div>
          </div>
        </div>

        {/* Merchant Stats Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">商家数据详情</h2>
          </div>

          {!merchants || merchants.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-4">还没有商家数据</p>
              <Link
                href="/admin/merchants/new"
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              >
                创建第一个商家
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商家名称
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      页面访问
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      表单提交
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      优惠券领取
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      转化率
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {merchants.map((merchant) => {
                    const stats = merchant.landing_page_stats?.[0]
                    const pageViews = stats?.total_page_views || 0
                    const formSubmits = stats?.total_form_submits || 0
                    const couponClaims = stats?.total_coupon_claims || 0
                    const conversionRate = stats?.conversion_rate || 0

                    return (
                      <tr key={merchant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {merchant.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              <a
                                href={`/${merchant.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                /{merchant.slug}
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${merchant.is_active
                                ? 'bg-orange-100/80 text-orange-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}
                          >
                            {merchant.is_active ? '启用' : '禁用'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {pageViews.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {formSubmits.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {couponClaims.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div
                            className={`text-sm font-bold ${conversionRate >= 5
                                ? 'text-orange-600'
                                : conversionRate >= 2
                                  ? 'text-yellow-600'
                                  : 'text-gray-600'
                              }`}
                          >
                            {conversionRate}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                          <Link
                            href={`/admin/merchants/${merchant.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            编辑
                          </Link>
                          <a
                            href={`/${merchant.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            查看
                          </a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">提示：</span>
            数据每次页面访问时实时更新。转化率 = (优惠券领取数 / 页面访问数) × 100%
          </p>
        </div>
      </div>
    </div>
  )
}
