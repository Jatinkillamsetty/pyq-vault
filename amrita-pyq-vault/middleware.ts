import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    // Admin routes protection
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow public pages & static assets
        if (
          pathname === "/" ||
          pathname.startsWith("/jee-practice") ||
          pathname.startsWith("/browse") ||
          pathname.startsWith("/cheatsheets") ||
          pathname.startsWith("/study-plan") ||
          pathname.startsWith("/ai") ||
          pathname.startsWith("/bookmarks") ||
          pathname.startsWith("/papers") ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/signup") ||
          pathname.startsWith("/uploads") ||
          pathname.startsWith("/api/papers") ||
          pathname.startsWith("/api/subjects") ||
          pathname.startsWith("/api/ai") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/_next") ||
          pathname.endsWith(".ico")
        ) {
          return true;
        }

        // Require authenticated session for admin and upload routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
