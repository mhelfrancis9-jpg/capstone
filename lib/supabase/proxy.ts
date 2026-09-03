import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

/**
 * Session helper for the Next.js 16 `proxy.ts` file.
 *
 * - Refreshes the Supabase auth cookie on every matching request.
 * - Redirects unauthenticated visitors away from /admin pages.
 * - Redirects authenticated users away from /admin/login.
 */
export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();

  // The final response object, mutated when cookies are refreshed.
  let response = NextResponse.next({ request });

  // Without config (e.g. during development setup) we skip all
  // auth guards so the app can still be browsed/rendered.
  if (!config) {
    return response;
  }

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, searchParams } = request.nextUrl;

  if (!user && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";

    // Preserve the intended destination so we can return here after
    // a successful sign in.
    const next = pathname + (searchParams.toString() ? `?${searchParams}` : "");
    loginUrl.searchParams.set("next", next);

    return NextResponse.redirect(loginUrl);
  }

  if (user && pathname === "/admin/login") {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/admin";
    dashboardUrl.search = "";
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}