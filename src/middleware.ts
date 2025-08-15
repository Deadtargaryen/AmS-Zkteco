import { NextResponse, NextRequest } from 'next/server'
import { withAuth } from 'next-auth/middleware'

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token
    if (token && token?.role !== 'ADMIN' && token?.role !== 'DIRECTOR') {
      return NextResponse.rewrite(new URL('/attendance/add', req.url))
    }
    if (token && token?.role !== 'DIRECTOR' && req.nextUrl.pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (token && token?.role === 'USER' && req.nextUrl.pathname.startsWith('/members')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (token && token?.role !== 'DIRECTOR' && req.nextUrl.pathname.startsWith('/profile')) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (token && token?.role !== 'DIRECTOR' && req.nextUrl.pathname.startsWith('/reports')) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
)

export const config = {
  matcher: ['/', '/zones/:path*', '/attendance/:path*', '/members/:path*', '/admin/:path*', '/profile/:path*', '/reports/:path*'],
}
