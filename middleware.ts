import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // רענון session אם קיים
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // רשימת routes שדורשים אימות
  const protectedRoutes = [
    '/dashboard',
    '/calculations',
    '/clients',
    '/settings',
    '/history',
  ]

  // בדיקה אם ה-path הנוכחי מוגן
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  )

  // אם זה route מוגן ואין session - הפנה להתחברות
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/auth/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // אם יש session והמשתמש מנסה להגיע ל-login/signup - הפנה ל-dashboard
  if (session && (req.nextUrl.pathname === '/auth/login' || req.nextUrl.pathname === '/auth/signup')) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
