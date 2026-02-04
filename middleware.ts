export { auth as middleware } from "./auth"

export const config = {
  matcher: [
    "/(dashboard)/(.*)",
    "/students/:path*",
    "/inquiries/:path*",
    "/enrollments/:path*",
    "/courses/:path*",
    "/centers/:path*",
  ],
}
