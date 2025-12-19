import { logoutAdmin } from '@/actions/auth'
import { getAllMerchantsStats } from '@/actions/analytics'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const merchants = await getAllMerchantsStats()

  // Calculate totals
  const totalMerchants = merchants.length

  const totalViews = merchants.reduce((acc, m) => {
    // metadata or result of join might be array or single object depending on supabase client generation
    const stats = Array.isArray(m.landing_page_stats) ? m.landing_page_stats[0] : m.landing_page_stats
    return acc + (stats?.total_page_views || 0)
  }, 0)

  const totalClaims = merchants.reduce((acc, m) => {
    const stats = Array.isArray(m.landing_page_stats) ? m.landing_page_stats[0] : m.landing_page_stats
    return acc + (stats?.total_coupon_claims || 0)
  }, 0)

  // Calculate overall conversion rate
  const overallConversion = totalViews > 0 ? ((totalClaims / totalViews) * 100).toFixed(1) + '%' : '0%'

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">欢迎使用 UpDeal</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Merchants Card */}
            <a
              href="/admin/merchants"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow group"
            >
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  活跃商家
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900 group-hover:text-blue-600">
                  {totalMerchants}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  当前平台入驻商家总数
                </p>
              </div>
            </a>

            {/* Total Views Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  总访问量 (Page Views)
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalViews}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  所有落地页的累计访问
                </p>
              </div>
            </div>

            {/* Total Claims Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  优惠领取
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {totalClaims}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  累计领券用户数
                </p>
              </div>
            </div>

            {/* Conversion Rate Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-sm font-medium text-gray-500 mb-1">
                  整体转化率
                </div>
                <div className="mt-1 text-3xl font-semibold text-gray-900">
                  {overallConversion}
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  访问 &rarr; 领券 转化比
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              🎉 欢迎使用 UpDeal MVP
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              系统已成功部署！数据来源说明：
            </p>
            <ul className="text-blue-700 text-sm list-disc list-inside space-y-1">
              <li>以上数据实时读取自数据库 internal analytics (landing_page_stats)。</li>
              <li>Page Views 统计每次 landing page 加载 (含刷新)。</li>
              <li>Google Analytics (GA4) 数据请前往 Google Analytics 后台查看更详细的用户画像。</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}
