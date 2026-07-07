import { NextResponse } from "next/server";
import type { NextRequest, NextFetchEvent } from "next/server";

const hasValidClerkKeys =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes("placeholder");

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

let clerkHandler: ((req: NextRequest, evt: NextFetchEvent) => Promise<NextResponse>) | null = null;

export async function middleware(request: NextRequest, event: NextFetchEvent) {
  if (hasValidClerkKeys) {
    if (!clerkHandler) {
      const { authMiddleware } = await import("@clerk/nextjs");
      clerkHandler = authMiddleware({
        publicRoutes: ["/api/health", "/sign-in", "/sign-up"],
      }) as (req: NextRequest, evt: NextFetchEvent) => Promise<NextResponse>;
    }
    return clerkHandler(request, event);
  }

  const response = NextResponse.next();
  for (const { key, value } of securityHeaders) {
    response.headers.set(key, value);
  }
  if (request.nextUrl.pathname.startsWith("/api/")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.svg).*)"],
};
