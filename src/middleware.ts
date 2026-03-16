import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/dashboard/:path*",
    "/admin/analytics/:path*",
    "/admin/projects/:path*",
    "/admin/skills/:path*",
    "/admin/blog/:path*",
    "/admin/achievements/:path*",
    "/admin/certificates/:path*",
    "/admin/experience/:path*",
    "/admin/testimonials/:path*",
    "/admin/profile/:path*",
    // NOTE: /admin/login is intentionally NOT listed here
    // so unauthenticated users can always reach the login page
  ],
};
