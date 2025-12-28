import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import LandingPageTemplate from '@/components/templates/LandingPageTemplate'
import MobilePremiumTemplate from '@/components/templates/MobilePremiumTemplate'
import ModernTemplate from '@/components/templates/ModernTemplate'
import { trackPageView } from '@/actions/analytics'
import type { Metadata } from 'next'
import type { Merchant } from '@/types/merchant'
// MetaPixel 已在 layout.tsx 全局加载，无需重复加载

type Props = {
  params: Promise<{ slug: string }>
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: merchant } = await supabase
    .from('merchants')
    .select('name, content')
    .eq('slug', slug)
    .single()

  if (!merchant) {
    return {
      title: 'Page Not Found',
    }
  }

  const content = merchant.content as any

  // Map new structure to metadata
  const title = content.businessName || merchant.name
  const description = content.offer?.description || content.heroSubtitle || 'Special Offer'

  return {
    title: `${content.offer?.value ? content.offer.value + ' Off - ' : ''}${title}`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: content.logoUrl ? [content.logoUrl] : [],
    },
  }
}

export default async function LandingPage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()

  // 1. Fetch Merchant
  const { data: merchant, error } = await supabase
    .from('merchants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !merchant) {
    notFound()
  }

  // 2. Fetch Claimed Count (Real Data)
  const { count: realClaimedCount } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)

  // Track page view
  await trackPageView(merchant.id)

  // 3. Social Proof Logic: Display count = Real + Virtual Base
  // Default to 200 base if not set, for that "busy" look
  const displayCount = (realClaimedCount || 0) + (merchant.virtual_base_count || 200)

  // 4. Render Template
  // Decide which template to use.
  // Default to MobilePremiumTemplate as requested, or switch based on type
  // If user specifically requested "Use this!!!", we default to it.
  const TemplateComponent = MobilePremiumTemplate;

  // 5. Admin Authorization for Visual Editor
  const { cookies } = await import('next/headers')
  const { validateSession } = await import('@/lib/auth/session')
  const cookieStore = await cookies()
  const token = cookieStore.get('updeal_admin_session')?.value
  let canEdit = false

  if (token) {
    try {
      const user = await validateSession(token)
      if (user) canEdit = true
    } catch (e) {
      // ignore invalid session
    }
  }

  return (
    <>
      {/* MetaPixel 已在 layout.tsx 全局加载，FB 会自动根据广告点击进行归因 */}

      <TemplateComponent
        merchant={merchant as unknown as any}
        claimedCount={displayCount}
        canEdit={canEdit}
      />
    </>
  )
}
