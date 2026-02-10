'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { merchantSchema, type MerchantFormData } from '@/lib/utils/validation'
import { cookies } from 'next/headers'
import { validateSession } from '@/lib/auth/session'

/**
 * Authentication Helper
 */
async function requireAdmin() {
  const cookieStore = await cookies()
  const token = cookieStore.get('updeal_admin_session')?.value

  if (!token) {
    throw new Error('Unauthorized: No session token')
  }

  const user = await validateSession(token)
  if (!user) {
    throw new Error('Unauthorized: Invalid session')
  }
}

export async function createMerchant(data: MerchantFormData) {
  try {
    await requireAdmin()

    const validated = merchantSchema.parse(data)
    const supabase = createAdminClient()

    const { data: merchant, error } = await supabase
      .from('merchants')
      .insert(validated)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/merchants')
    return { success: true, merchant }
  } catch (error: any) {
    // Return detailed Zod validation errors if available
    if (error.issues) {
      const issues = error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return { success: false, error: `Validation Error: ${issues}` }
    }
    return { success: false, error: error.message || 'Unknown error occurred' }
  }
}

export async function updateMerchant(id: string, data: MerchantFormData) {
  try {
    await requireAdmin()

    const validated = merchantSchema.parse(data)
    const supabase = createAdminClient()

    const { data: merchant, error } = await supabase
      .from('merchants')
      .update(validated)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/admin/merchants')
    revalidatePath(`/${merchant.slug}`)
    return { success: true, merchant }
  } catch (error: any) {
    if (error.issues) {
      const issues = error.issues.map((i: any) => `${i.path.join('.')}: ${i.message}`).join(', ')
      return { success: false, error: `Validation Error: ${issues}` }
    }
    return { success: false, error: error.message || 'Update failed' }
  }
}

export async function deleteMerchant(id: string) {
  try {
    await requireAdmin()

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('merchants')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/merchants')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function generateSlug(name: string): Promise<string> {
  // Even slug generation should be protected to prevent abuse/enumeration
  try {
    await requireAdmin()
  } catch (e) {
    // If called from client without auth, it will fail.
    // But we can choose to leave this public if strictly necessary (e.g. public signup).
    // Since this is for Admin Panel "New Merchant" form, we protect it.
    return ''
  }

  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const supabase = createAdminClient()
  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data } = await supabase
      .from('merchants')
      .select('id')
      .eq('slug', slug)
      .single()

    if (!data) break

    slug = `${baseSlug}-${counter}`
    counter++
  }

  return slug
}

export async function getMerchant(id: string) {
  await requireAdmin()

  const supabase = createAdminClient()

  const { data: merchant, error } = await supabase
    .from('merchants')
    .select(`
      *,
      landing_page_stats (
        total_page_views,
        total_form_submits,
        total_coupon_claims,
        conversion_rate,
        last_calculated_at
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') { // No rows found
      return null
    }
    console.error('Error fetching merchant:', error)
    return null
  }

  /*
   * UPDATED ANALYTICS STATS FETCHING (Real-time Counts)
   * Instead of relying on possibly out-of-sync landing_page_stats table,
   * we count the actual rows in page_views and customer_claims.
   */
  if (merchant) {
    try {
      const [
        { count: pageViewsCount },
        { count: claimsCount },
        { count: redemptionsCount },
        { count: formSubmitsCount }
      ] = await Promise.all([
        // Count total page views from page_views table
        supabase.from('page_views').select('*', { count: 'exact', head: true }).eq('merchant_id', id),
        // Count total claims from coupons table (actual claims)
        supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', id),
        // Count total redemptions
        supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('merchant_id', id).eq('status', 'redeemed'),
        // Count submits from events (as backup if separate table not used for submits yet)
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('merchant_id', id).eq('event_type', 'form_submit')
      ])

      const totalPageViews = pageViewsCount || 0
      const totalClaims = claimsCount || 0
      const conversionRate = totalPageViews > 0 ? ((totalClaims / totalPageViews) * 100).toFixed(2) : 0

      // @ts-expect-error - Injecting calculated stats into typed response
      merchant.landing_page_stats = {
        total_page_views: totalPageViews,
        total_coupon_claims: totalClaims,
        total_redemptions: redemptionsCount || 0,
        total_form_submits: formSubmitsCount || 0,
        conversion_rate: Number(conversionRate),
        last_calculated_at: new Date().toISOString()
      }
    } catch (statsError) {
      console.error('Error calculating live stats, falling back to cached:', statsError)
    }
  }

  return merchant
}

export async function toggleMerchantStatus(id: string, isActive: boolean) {
  try {
    await requireAdmin()

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('merchants')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/merchants')
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

