export { default } from "next-auth/middleware";

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
  ],
};
