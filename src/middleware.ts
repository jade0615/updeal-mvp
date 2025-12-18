import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { validateSession } from '@/lib/auth/session'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next()

  // Generate session ID for analytics if not present
  if (!request.cookies.has('updeal_session_id')) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`

    response.cookies.set('updeal_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })
  }

  // Admin Authentication
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip login page
    if (request.nextUrl.pathname === '/admin/login') {
      return response
    }

    const token = request.cookies.get('updeal_admin_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verify session
    try {
      const user = await validateSession(token)
      if (!user) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } catch (e) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
