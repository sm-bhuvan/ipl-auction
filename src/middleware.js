import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer')
  const isInternalNav = request.cookies.get('internal-nav')?.value === 'true'

  // Define protected paths
  const protectedPaths = ['/auctionroom', '/Mainroom', '/dashboard']
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath) {
    // Allow if:
    // 1. Coming from same origin (referer matches), OR
    // 2. Has internal-nav cookie (refresh or internal redirect)
    if (referer?.startsWith(request.nextUrl.origin) || isInternalNav) {
      // Set cookie for subsequent requests (like refreshes)
      const response = NextResponse.next()
      response.cookies.set('internal-nav', 'true', { sameSite: 'strict', path: '/' })
      return response
    }

    // Redirect to homepage for direct access or external referrers
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Clear the cookie if not on a protected path
  const response = NextResponse.next()
  response.cookies.delete('internal-nav')
  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}