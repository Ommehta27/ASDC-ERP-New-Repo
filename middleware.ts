import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Get the token from the request
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  // If no token, redirect to login
  if (!token) {
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/(dashboard)/(.*)",
    "/students/:path*",
    "/inquiries/:path*",
    "/enrollments/:path*",
    "/courses/:path*",
    "/centers/:path*",
    "/finance/:path*",
    "/hr/:path*",
    "/inventory/:path*",
    "/procurement/:path*",
    "/purchases/:path*",
    "/setup/:path*",
    "/crm/:path*",
    "/workflows/:path*",
  ],
}
