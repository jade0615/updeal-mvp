'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { resend, DEFAULT_FROM_EMAIL } from '@/lib/email/resend'
import { getCouponClaimedEmailTemplate } from '@/lib/email/templates'

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

        // --- Send Confirmation Email ---
        if (validated.email && resend) {
            try {
                // Fetch merchant name for the email
                const { data: merchant } = await supabase
                    .from('merchants')
                    .select('name')
                    .eq('id', validated.merchant_id)
                    .single();

                await resend.emails.send({
                    from: DEFAULT_FROM_EMAIL,
                    to: validated.email,
                    subject: `🎁 Your Coupon from ${merchant?.name || 'Updeal'} is Ready!`,
                    html: getCouponClaimedEmailTemplate({
                        name: validated.name,
                        couponCode: validated.coupon_code,
                        merchantName: merchant?.name,
                    }),
                });
            } catch (emailError) {
                // Log but don't fail the claim if email fails
                console.error('Failed to send claim email:', emailError);
            }
        }

        // Optional: Revalidate analytics or merchant page if needed
        // revalidatePath(`/admin/merchants/${validated.merchant_id}`) 

        return { success: true, claim }
    } catch (error: any) {
        console.error('Create claim exception:', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}
