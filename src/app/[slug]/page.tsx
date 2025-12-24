import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import LandingPageTemplate from '@/components/templates/LandingPageTemplate'
import ModernTemplate from '@/components/templates/ModernTemplate'
import { trackPageView } from '@/actions/analytics'
import type { Metadata } from 'next'
import type { Merchant } from '@/types/merchant'
import MetaPixel from '@/components/analytics/MetaPixel'

type Props = {
  params: Promise<{ slug: string }>
}

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
  const ga4Id = merchant.ga4_measurement_id || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID

  // Decide which template to use.
  const TemplateComponent = LandingPageTemplate;

  return (
    <>
      {/* Google Analytics 4 */}
      {ga4Id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      <MetaPixel pixelId={merchant.meta_pixel_id || process.env.NEXT_PUBLIC_META_PIXEL_ID} />

      <TemplateComponent
        merchant={merchant as unknown as any}
        claimedCount={displayCount}
      />
    </>
  )
}
