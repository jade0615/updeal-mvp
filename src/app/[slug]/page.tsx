import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import LandingPageTemplate from '@/components/templates/LandingPageTemplate'
import { trackPageView } from '@/actions/analytics'
import type { Metadata } from 'next'
import type { Merchant } from '@/types/merchant'

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
    // .eq('is_active', true) // Include if is_active is strictly required, but usually good to check
    .single()

  if (error || !merchant) {
    notFound()
  }

  // 2. Fetch Claimed Count
  const { count: claimedCount } = await supabase
    .from('coupons')
    .select('*', { count: 'exact', head: true })
    .eq('merchant_id', merchant.id)

  // Track page view
  await trackPageView(merchant.id)

  // 3. Render Template
  // We use the new LandingPageTemplate for all merchants as per the update request
  return (
    <>
      {/* Google Analytics 4 */}
      {merchant.ga4_measurement_id && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${merchant.ga4_measurement_id}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${merchant.ga4_measurement_id}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}

      <LandingPageTemplate
        merchant={merchant as unknown as Merchant}
        claimedCount={claimedCount || 0}
      />
    </>
  )
}
