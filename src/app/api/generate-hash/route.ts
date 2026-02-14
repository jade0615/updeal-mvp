import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

/**
 * Temporary endpoint to generate password hashes for merchant setup
 * DELETE THIS FILE after setting up merchant accounts
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const password = searchParams.get('password')

        if (!password) {
            return NextResponse.json({
                error: 'Missing password parameter',
                usage: 'Call /api/generate-hash?password=YOUR_PASSWORD'
            }, { status: 400 })
        }

        // Generate hash with same settings as login
        const hash = await bcrypt.hash(password, 10)

        return NextResponse.json({
            success: true,
            password: password,
            hash: hash,
            sql: `UPDATE merchants SET password_hash = '${hash}' WHERE email = 'YOUR_EMAIL';`
        })

    } catch (error: any) {
        console.error('Hash generation error:', error)
        return NextResponse.json({
            error: 'Failed to generate hash',
            details: error.message
        }, { status: 500 })
    }
}
