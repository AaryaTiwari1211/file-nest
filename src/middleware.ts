import { NextResponse } from "next/server";
import { authMiddleware, redirectToSignIn } from "@clerk/nextjs/server";

export default authMiddleware({
  publicRoutes: ["/sign-in", "/sign-up", "/"],
  afterAuth(auth, req, evt) {
    const url = new URL(req.url);

    if (url.pathname.startsWith("/sso-callback")) {
      return NextResponse.redirect(new URL("/dashboard/files", req.url));
    }

    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if (auth.userId && !auth.isPublicRoute) {
      return NextResponse.next();
    }

    return NextResponse.next();
  },
  debug: true,
  signInUrl: "/sign-in",
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
