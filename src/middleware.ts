import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: ["/sign-in", "/sign-up", "/"],
  async afterAuth(auth, req, evt) {
    const url = new URL(req.url);
    const role = auth?.sessionClaims?.metadata?.role

    if (
      url.pathname.startsWith("/sso-callback") ||
      url.pathname.startsWith("/sign-in/sso-callback") ||
      url.pathname.startsWith("/sign-up/sso-callback")
    ) {
      return NextResponse.redirect(new URL("/dashboard/files", req.url));
    }

    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if(url.pathname.startsWith("/dashboard/admin") && role !== "admin" && role !== "super-admin") {
      return NextResponse.redirect(new URL("/dashboard/files", req.url));
    }

    if ((url.pathname === "/dashboard/admin" || url.pathname.startsWith("/dashboard/admin/")) && role === "member") {
      return NextResponse.redirect(new URL("/dashboard/files", req.url));
    }
    return NextResponse.next();
  }
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
