import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*', 
    '/tasks/:path*',
    '/qc/:path*',
    '/inventory/:path*',
    '/bom/:path*',
    '/users/:path*',
    '/settings/:path*'
  ]
}