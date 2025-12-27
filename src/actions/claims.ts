'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const claimSchema = z.object({
    merchant_id: z.string().uuid(),
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(10, "Phone number is required"),
    email: z.string().email().optional().or(z.literal('')),
    coupon_code: z.string().min(1, "Coupon code is required"),
})

export type ClaimFormData = z.infer<typeof claimSchema>

export async function createClaim(data: ClaimFormData) {
    try {
        const validated = claimSchema.parse(data)
        const supabase = createAdminClient()

        // Clean up email if empty string
        if (validated.email === '') {
            delete validated.email;
        }

        const { data: claim, error } = await supabase
            .from('customer_claims')
            .insert({
                merchant_id: validated.merchant_id,
                name: validated.name,
                phone: validated.phone,
                email: validated.email || null,
                coupon_code: validated.coupon_code,
                status: 'claimed',
                claimed_at: new Date().toISOString()
            })
            .select()
            .single()

        if (error) {
            console.error('Error creating claim:', error)
            return { success: false, error: 'Failed to create claim. Please try again.' }
        }

        // Optional: Revalidate analytics or merchant page if needed
        // revalidatePath(`/admin/merchants/${validated.merchant_id}`) 

        return { success: true, claim }
    } catch (error: any) {
        console.error('Create claim exception:', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}
