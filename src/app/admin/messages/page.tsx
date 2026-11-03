import { requireAdminPage } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  // Service-role read below bypasses RLS, so verify the admin here as well as in the proxy.
  await requireAdminPage("/admin/messages");
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  const messages = (data ?? []) as ContactMessage[];

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-on-surface">Contact messages</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Submissions from the public Contact page.
        </p>
      </div>

      {error ? (
        <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">
          Could not load messages.
        </p>
      ) : messages.length === 0 ? (
        <p className="rounded-xl border border-outline-variant/20 bg-surface-container px-6 py-10 text-center text-on-surface-variant">
          No messages yet.
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className="rounded-xl border border-[#e4ddd6] bg-surface-container p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-on-surface">{msg.name}</p>
                <time className="text-xs text-on-surface-variant">
                  {new Date(msg.created_at).toLocaleString()}
                </time>
              </div>
              <a
                href={`mailto:${msg.email}`}
                className="mt-1 inline-block text-sm text-primary hover:underline"
              >
                {msg.email}
              </a>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-on-surface-variant">
                {msg.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
