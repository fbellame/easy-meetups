import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const { data: { user }, error } = await supabase.auth.getUser()
  
  console.log('Middleware: User check', { 
    hasUser: !!user, 
    userEmail: user?.email, 
    pathname: request.nextUrl.pathname,
    error: error?.message
  })

  // Refresh the session to ensure cookies are properly set
  const { data: { session } } = await supabase.auth.getSession()
  console.log('Middleware: Session check', { 
    hasSession: !!session, 
    userEmail: session?.user?.email,
    pathname: request.nextUrl.pathname
  })

  // Force refresh the session to ensure cookies are properly set
  const { data: { session: refreshedSession } } = await supabase.auth.refreshSession()
  console.log('Middleware: Refreshed session', { 
    hasSession: !!refreshedSession, 
    userEmail: refreshedSession?.user?.email,
    pathname: request.nextUrl.pathname
  })

  // Define protected routes (including root dashboard)
  const protectedRoutes = ['/', '/events', '/hosts', '/speakers', '/community', '/announcements']
  const isProtectedRoute = protectedRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  )

  // Only redirect to login if user is not authenticated and trying to access protected route
  if (isProtectedRoute && !user && !error) {
    console.log('Middleware: Redirecting to login for protected route')
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  console.log('Middleware: Auth check completed', { 
    isProtectedRoute, 
    hasUser: !!user, 
    pathname: request.nextUrl.pathname 
  })

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
