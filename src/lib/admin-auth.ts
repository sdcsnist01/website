import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/**
 * Same authorization rule as the /admin middleware: signed in with the admin role.
 * Use in API route handlers, which the /admin middleware matcher does not cover.
 */
export async function requireAdmin(): Promise<{ userId: string } | { response: NextResponse }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Not signed in." }, { status: 401, headers: NO_STORE }) };
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return { response: NextResponse.json({ error: "Admin access required." }, { status: 403, headers: NO_STORE }) };
  }

  return { userId: user.id };
}

/**
 * Page-level admin check for server components that read with the service role.
 * The /admin proxy is an optimistic first check; this keeps those pages safe even
 * if the proxy is ever misconfigured. Redirects the same way the proxy does.
 */
export async function requireAdminPage(nextPath: string): Promise<{ userId: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    redirect("/admin/login?error=unauthorized");
  }

  return { userId: user.id };
}
