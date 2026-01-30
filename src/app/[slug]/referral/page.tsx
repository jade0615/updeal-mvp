
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import ReferralDashboardTemplate from '@/components/templates/ReferralDashboardTemplate'
import { validateSession } from '@/lib/auth/session'
import { cookies } from 'next/headers'

type Props = {
    params: Promise<{ slug: string }>
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export const dynamic = 'force-dynamic';

export default async function ReferralPage({ params, searchParams }: Props) {
    const { slug } = await params
    const query = await searchParams
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

    // 2. Identify User (Referrer)
    // Attempt to get user from session cookie (admin or end-user if we had one)
    // Or from query param `uid` (insecure but common for MVP email links)
    // For this demo, we'll try to get it, or fallback to a demo ID so the UI works.

    let userId = 'demo-referrer-id';
    // Check admin session (just in case they are previewing)
    const cookieStore = await cookies()
    const token = cookieStore.get('updeal_admin_session')?.value

    /* 
       In a real scenario, we would have customer authentication here.
       For now, if 'uid' is passed in query, we use it (assuming link sent to user).
       Otherwise, default to demo to show the UI.
    */
    if (typeof query.uid === 'string') {
        userId = query.uid;
    }

    return (
        <ReferralDashboardTemplate
            merchant={merchant as any}
            userId={userId}
            referralCode={`REF-${userId.substring(0, 6).toUpperCase()}`}
        />
    )
}
