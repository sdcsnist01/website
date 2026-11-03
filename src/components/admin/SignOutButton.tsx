"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={signOut}
      className="rounded-full border border-[#d8d2cf] bg-white px-3 py-1.5 text-xs font-semibold text-on-surface-variant transition-colors hover:text-primary"
    >
      Sign out
    </button>
  );
}
