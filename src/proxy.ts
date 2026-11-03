import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next.js 16 loads proxy.ts (formerly middleware.ts) from the same level as `app`,
// which is `src/` in this project. A root-level file is never run.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: ["/admin/:path*"],
};
