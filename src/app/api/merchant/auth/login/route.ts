
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import { createMerchantSession } from '@/lib/merchant-auth'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, remember } = body

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            )
        }

        const supabase = createAdminClient()

        // 1. Find merchant by email
        const { data: merchant, error } = await supabase
            .from('merchants')
            .select('id, password_hash, name, is_active')
            .eq('email', email)
            .single()

        if (error || !merchant) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // 2. Check if merchant is active
        if (merchant.is_active === false) {
            return NextResponse.json(
                { error: 'Account is disabled. Please contact support.' },
                { status: 403 }
            )
        }

        // 3. Check password
        // If no password hash exists yet (migration period), we might want to allow setting it?
        // For now, assume it must exist.
        if (!merchant.password_hash) {
            return NextResponse.json(
                { error: 'Account not set up for login yet' },
                { status: 401 }
            )
        }

        const isValid = await bcrypt.compare(password, merchant.password_hash)

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            )
        }

        // 4. Create session
        await createMerchantSession(merchant.id, remember)

        // 5. Update last login
        await supabase
            .from('merchants')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', merchant.id)

        return NextResponse.json({
            success: true,
            merchant: {
                id: merchant.id,
                name: merchant.name
            },
            redirectTo: '/merchant/dashboard'
        })

    } catch (error: any) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
