import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  const referer = request.headers.get('referer')

  // Define URL paths that should redirect to homepage (including all sub-paths)
  const redirectPaths = ['/auctionroom', '/Mainroom', '/dashboard']

  // Check if current pathname starts with any redirect path
  const shouldRedirect = redirectPaths.some(path => pathname.startsWith(path))
  
  if (shouldRedirect) {
    // Allow if request comes from same site (internal navigation)
    if (referer && referer.startsWith(request.nextUrl.origin)) {
      return NextResponse.next()
    }
    
    // Redirect to homepage if manually typed or from external source
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Continue with the request if no redirect is needed
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}