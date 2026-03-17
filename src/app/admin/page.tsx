import { logoutAdmin } from '@/actions/auth'
import { getAllMerchantsStats } from '@/actions/analytics'
import { getNYLastUpdatedMessage } from '@/lib/utils/date'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const [merchants24h, merchantsAll] = await Promise.all([
    getAllMerchantsStats('24h'),
    getAllMerchantsStats('all'),
  ])

  const totalMerchants = merchantsAll.length

  const views24h = merchants24h.reduce((acc, m) => acc + (m.real_stats?.views || 0), 0)
  const claims24h = merchants24h.reduce((acc, m) => acc + (m.real_stats?.claims || 0), 0)
  const redemptions24h = merchants24h.reduce((acc, m) => acc + (m.real_stats?.redemptions || 0), 0)
  const rate24h = claims24h > 0 ? ((redemptions24h / claims24h) * 100).toFixed(1) + '%' : '0%'

  const allViews = merchantsAll.reduce((acc, m) => acc + (m.real_stats?.views || 0), 0)
  const allClaims = merchantsAll.reduce((acc, m) => acc + (m.real_stats?.claims || 0), 0)
  const allRedemptions = merchantsAll.reduce((acc, m) => acc + (m.real_stats?.redemptions || 0), 0)
  const allReferrals = 0 // placeholder, can be added if referrals table has count

  // Conversion rates
  const allRate = allClaims > 0 ? ((allRedemptions / allClaims) * 100).toFixed(1) + '%' : '0%'

  return (
    <div className="min-h-screen bg-[#f8fbff]">
      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">运营概览</h1>
              <p className="mt-2 text-slate-500 font-medium">实时监控全平台商家经营数据 (America/New_York)</p>
              <p className="mt-1 text-sm text-blue-600 font-bold bg-blue-50/50 px-3 py-1 rounded-lg inline-block">
                数据更新时间：{getNYLastUpdatedMessage()}
              </p>
            </div>
            <div className="flex gap-3">
              <a href="/admin/merchants" className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                管理商家
              </a>
              <a href="/admin/analytics" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-blue-200 shadow-lg">
                详细报表
              </a>
            </div>
          </div>

          {/* ── Last 24 Hours (Rolling) ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">过去 24 小时</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="24h 访问"
                value={views24h}
                icon="🕒"
                subtitle="近 24h 浏览量"
                color="indigo"
              />
              <DashboardCard
                title="24h 领取"
                value={claims24h}
                icon="🎟️"
                subtitle="近 24h 发券量"
                color="purple"
              />
              <DashboardCard
                title="24h 核销"
                value={redemptions24h}
                icon="✅"
                subtitle={`核销转化率 ${rate24h}`}
                highlight={rate24h}
                color="emerald"
              />
              <DashboardCard
                title="24h 核销率"
                value={rate24h}
                icon="📈"
                subtitle={`${redemptions24h} / ${claims24h}`}
                color="teal"
                isText
              />
            </div>
          </div>

          {/* ── All-Time Cumulative Stats (Default) ── */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-widest">累计总量</span>
              <div className="flex-1 h-px bg-amber-100" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <DashboardCard
                title="入驻商家"
                value={totalMerchants}
                icon="🏪"
                subtitle="个活跃商户"
                color="blue"
              />
              <DashboardCard
                title="累计访问"
                value={allViews}
                icon="📊"
                subtitle="历史总访问人次"
                color="amber"
              />
              <DashboardCard
                title="累计领取"
                value={allClaims}
                icon="🎁"
                subtitle="历史总发券量"
                color="orange"
              />
              <DashboardCard
                title="累计核销"
                value={allRedemptions}
                icon="🏆"
                subtitle={`核销转化率 ${allRate}`}
                highlight={allRate}
                color="rose"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Access */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-lg">⚡</span>
                快捷功能
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <QuickLink
                  href="/admin/merchants/new"
                  title="开通新商家"
                  desc="快速创建落地页并上线"
                  icon="✨"
                  bg="bg-orange-50"
                />
                <QuickLink
                  href="/admin/customers"
                  title="客户名单导出"
                  desc="管理各店领券客户信息"
                  icon="👥"
                  bg="bg-blue-50"
                />
              </div>
            </div>

            {/* Success Rate */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">平均核销率（累计）</p>
                <div className="text-5xl font-black mb-6">{allRate}</div>

                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-slate-400">核销 / 领取 转化</span>
                    <span className="text-emerald-400">{allRedemptions} / {allClaims}</span>
                  </div>
                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                      style={{ width: allRate }}
                    />
                  </div>
                </div>
              </div>
              {/* Decoration */}
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function DashboardCard({ title, value, icon, subtitle, highlight, color, isText }: any) {
  const colors: any = {
    blue: 'text-blue-600 bg-blue-50',
    indigo: 'text-indigo-600 bg-indigo-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50',
    amber: 'text-amber-600 bg-amber-50',
    orange: 'text-orange-600 bg-orange-50',
    rose: 'text-rose-600 bg-rose-50',
    teal: 'text-teal-600 bg-teal-50',
  }
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 hover:scale-[1.02] transition-transform">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${colors[color]}`}>
          {icon}
        </div>
        {highlight && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">
            {highlight} 转化率
          </span>
        )}
      </div>
      <div className="text-3xl font-black text-slate-900 mb-1">
        {isText ? value : (typeof value === 'number' ? value.toLocaleString() : value)}
      </div>
      <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-1">{title}</div>
      <div className="text-xs text-slate-400">{subtitle}</div>
    </div>
  )
}

function QuickLink({ href, title, desc, icon, bg }: any) {
  return (
    <a href={href} className={`flex items-center gap-4 p-5 rounded-2xl transition-all hover:shadow-lg border border-transparent hover:border-slate-100 group ${bg}`}>
      <span className="text-3xl group-hover:scale-110 transition-transform">{icon}</span>
      <div>
        <div className="font-bold text-slate-900">{title}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
    </a>
  )
}
