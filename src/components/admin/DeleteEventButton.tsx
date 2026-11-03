"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteEventButton({ eventId, title }: { eventId: string; title: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    router.push("/admin/events");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="rounded-lg border border-primary/30 px-3 py-1.5 text-xs font-semibold text-[#7a1220] transition-colors hover:bg-[#fdf0f0] disabled:opacity-60"
    >
      {loading ? "Deleting…" : "Delete"}
    </button>
  );
}
