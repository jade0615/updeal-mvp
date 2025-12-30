'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { cookies, headers } from 'next/headers'

export type EventType = 'page_view' | 'form_submit' | 'coupon_claim' | 'coupon_redeem' | 'button_click'

interface TrackEventParams {
  eventType: EventType
  merchantId: string
  userId?: string
  sessionId?: string
  pageUrl?: string
  referrer?: string
  metadata?: Record<string, any>
  utm?: {
    source?: string
    medium?: string
    campaign?: string
    term?: string
    content?: string
  }
}

/**
 * Track any event to the events table
 */
export async function trackEvent(params: TrackEventParams) {
  try {
    const supabase = createAdminClient()
    const headersList = await headers()
    const cookieStore = await cookies()

    // Get session ID from cookie (set by middleware)
    const sessionId = params.sessionId || cookieStore.get('updeal_session_id')?.value || 'unknown_session'

    // Get user agent and referrer from headers
    const userAgent = headersList.get('user-agent') || undefined
    const referrer = params.referrer || headersList.get('referer') || undefined

    await supabase.from('events').insert({
      event_type: params.eventType,
      merchant_id: params.merchantId,
      user_id: params.userId || null,
      session_id: sessionId,
      page_url: params.pageUrl || undefined,
      referrer,
      user_agent: userAgent,
      metadata: params.metadata || {},
      utm_source: params.utm?.source,
      utm_medium: params.utm?.medium,
      utm_campaign: params.utm?.campaign,
    })

    return { success: true, sessionId }
  } catch (error) {
    console.error('Track event error:', error)
    return { success: false, error }
  }
}

/**
 * Track page view - called when landing page loads
 */
export async function trackPageView(merchantId: string, pageUrl?: string) {
  const supabase = createAdminClient()

  // Track the event
  await trackEvent({
    eventType: 'page_view',
    merchantId,
    pageUrl,
    utm: parseUtmFromUrl(pageUrl),
  })

  // Insert into new page_views table (User requested Schema)
  try {
    const headersList = await headers()
    const userAgent = headersList.get('user-agent') || undefined

    await supabase.from('page_views').insert({
      merchant_id: merchantId,
      ip_address: undefined, // Not easily available in headers without proxy trust
      user_agent: userAgent,
      viewed_at: new Date().toISOString()
    })
  } catch (e) {
    console.error('Failed to log page view:', e)
  }

  // Update landing page stats
  try {
    // First check if stats record exists
    const { data: existingStats } = await supabase
      .from('landing_page_stats')
      .select('id, total_page_views')
      .eq('merchant_id', merchantId)
      .single()

    if (existingStats) {
      // Update existing record
      await supabase
        .from('landing_page_stats')
        .update({
          total_page_views: (existingStats.total_page_views || 0) + 1,
          last_calculated_at: new Date().toISOString(),
        })
        .eq('merchant_id', merchantId)
    } else {
      // Create new record
      await supabase
        .from('landing_page_stats')
        .insert({
          merchant_id: merchantId,
          total_page_views: 1,
          total_form_submits: 0,
          total_coupon_claims: 0,
          conversion_rate: 0,
        })
    }
  } catch (error) {
    console.error('Error updating page view stats:', error)
  }

  return { success: true }
}

/**
 * Track coupon claim - called when user successfully claims a coupon
 */
export async function trackCouponClaim(merchantId: string, userId?: string, couponCode?: string) {
  const supabase = createAdminClient()

  // Track the event
  await trackEvent({
    eventType: 'coupon_claim',
    merchantId,
    userId,
    metadata: couponCode ? { coupon_code: couponCode } : undefined,
  })

  // Update landing page stats
  try {
    const { data: existingStats } = await supabase
      .from('landing_page_stats')
      .select('id, total_coupon_claims, total_page_views')
      .eq('merchant_id', merchantId)
      .single()

    if (existingStats) {
      const newClaims = (existingStats.total_coupon_claims || 0) + 1
      const pageViews = existingStats.total_page_views || 1
      const conversionRate = (newClaims / pageViews) * 100

      await supabase
        .from('landing_page_stats')
        .update({
          total_coupon_claims: newClaims,
          conversion_rate: Number(conversionRate.toFixed(2)),
          last_calculated_at: new Date().toISOString(),
        })
        .eq('merchant_id', merchantId)
    } else {
      // Create new record if doesn't exist
      await supabase
        .from('landing_page_stats')
        .insert({
          merchant_id: merchantId,
          total_page_views: 0,
          total_form_submits: 0,
          total_coupon_claims: 1,
          conversion_rate: 0,
        })
    }
  } catch (error) {
    console.error('Error updating coupon claim stats:', error)
  }

  return { success: true }
}

/**
 * Track form submission
 */
export async function trackFormSubmit(merchantId: string, userId?: string) {
  const supabase = createAdminClient()

  await trackEvent({
    eventType: 'form_submit',
    merchantId,
    userId,
  })

  // Update landing page stats
  try {
    const { data: existingStats } = await supabase
      .from('landing_page_stats')
      .select('id, total_form_submits')
      .eq('merchant_id', merchantId)
      .single()

    if (existingStats) {
      await supabase
        .from('landing_page_stats')
        .update({
          total_form_submits: (existingStats.total_form_submits || 0) + 1,
          last_calculated_at: new Date().toISOString(),
        })
        .eq('merchant_id', merchantId)
    }
  } catch (error) {
    console.error('Error updating form submit stats:', error)
  }

  return { success: true }
}

/**
 * Get merchant analytics stats
 */
export async function getMerchantStats(merchantId: string) {
  const supabase = createAdminClient()

  const { data: stats, error } = await supabase
    .from('landing_page_stats')
    .select('*')
    .eq('merchant_id', merchantId)
    .single()

  if (error) {
    console.error('Error fetching merchant stats:', error)
    return null
  }

  return stats
}

/**
 * Calculate and update conversion rate for a merchant
 */
export async function updateConversionRate(merchantId: string) {
  const supabase = createAdminClient()

  const { data: stats } = await supabase
    .from('landing_page_stats')
    .select('total_page_views, total_coupon_claims')
    .eq('merchant_id', merchantId)
    .single()

  if (stats && stats.total_page_views > 0) {
    const conversionRate = (stats.total_coupon_claims / stats.total_page_views) * 100

    await supabase
      .from('landing_page_stats')
      .update({
        conversion_rate: Number(conversionRate.toFixed(2)),
        last_calculated_at: new Date().toISOString(),
      })
      .eq('merchant_id', merchantId)
  }
}

/**
 * Get recent events for a merchant
 */
export async function getMerchantEvents(
  merchantId: string,
  limit: number = 50,
  eventType?: EventType
) {
  const supabase = createAdminClient()

  let query = supabase
    .from('events')
    .select('*, users(phone, email)')
    .eq('merchant_id', merchantId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (eventType) {
    query = query.eq('event_type', eventType)
  }

  const { data: events, error } = await query

  if (error) {
    console.error('Error fetching events:', error)
    return []
  }

  return events
}

/**
 * Get aggregated stats for all merchants (admin dashboard)
 */
export async function getAllMerchantsStats() {
  const supabase = createAdminClient()

  // 1. Fetch basic merchant info
  const { data: merchants, error } = await supabase
    .from('merchants')
    .select(`
      id,
      name,
      slug,
      internal_id,
      redeem_pin,
      template_type,
      is_active,
      virtual_base_count,
      landing_page_stats (
        total_page_views,
        total_form_submits,
        total_coupon_claims,
        conversion_rate,
        last_calculated_at
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching all merchants stats:', error)
    return []
  }

  // 2. Fetch Real-time Aggregations for each merchant
  // We use Promise.all to fetch them in parallel for performance
  const enrichedMerchants = await Promise.all(merchants.map(async (merchant) => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayISO = todayStart.toISOString();

    const [
      { count: totalViews },
      { count: todayViews },
      { count: totalClaims },
      { count: totalRedeemed },
      { count: todayRedeemed }
    ] = await Promise.all([
      // Total Views (Trusting landing_page_stats for speed where possible, but querying for "Real" consistency if cache is suspect)
      // Using direct count for now to ensure 100% match with user expectation of "Real Data"
      supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id),

      // Today Views
      supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).gte('viewed_at', todayISO),

      // Total Claims (True count from coupons)
      supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id),

      // Total Redemptions (True count)
      supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('status', 'redeemed'),

      // Today Redemptions
      supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', merchant.id).eq('status', 'redeemed').gte('redeemed_at', todayISO)
    ]);

    // Calculate Rate
    const realTotalViews = totalViews || 0;
    const realTotalClaims = totalClaims || 0;
    const realTotalRedeemed = totalRedeemed || 0;

    // Fallback: If page views table is empty (legacy), try to use landing_page_stats
    const finalViews = realTotalViews > 0 ? realTotalViews : (merchant.landing_page_stats?.[0]?.total_page_views || 0);

    // Redemption Rate = Redeemed / Claims (NOT Views, as per user request to see quality of claims)
    const redemptionRate = realTotalClaims > 0 ? ((realTotalRedeemed / realTotalClaims) * 100).toFixed(1) : '0.0';

    return {
      ...merchant,
      real_stats: {
        views: finalViews,
        today_views: todayViews || 0,
        claims: realTotalClaims,
        redemptions: realTotalRedeemed,
        today_redemptions: todayRedeemed || 0,
        redemption_rate: redemptionRate
      }
    };
  }));

  return enrichedMerchants
}

function parseUtmFromUrl(url?: string) {
  if (!url) return undefined
  try {
    const urlObj = new URL(url, 'http://localhost') // Base needed for relative URLs
    const params = urlObj.searchParams
    if (!params.get('utm_source')) return undefined

    return {
      source: params.get('utm_source') || undefined,
      medium: params.get('utm_medium') || undefined,
      campaign: params.get('utm_campaign') || undefined,
      term: params.get('utm_term') || undefined,
      content: params.get('utm_content') || undefined,
    }
  } catch (e) {
    return undefined
  }
}
