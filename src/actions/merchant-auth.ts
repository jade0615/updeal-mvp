'use server'

import { logoutMerchant } from '@/lib/merchant-auth'
import { redirect } from 'next/navigation'

export async function logoutMerchantAction() {
    await logoutMerchant()
    redirect('/merchant/login')
}
