import Link from "next/link";

export const metadata = {
  title: "Admin | SDC SNIST",
  robots: { index: false, follow: false },
};

const ADMIN_LINKS = [
  { href: "/admin/events", label: "Events" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/payments", label: "Payments" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/timer", label: "Timer" },
  { href: "/", label: "View site" },
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <header className="border-b border-[#e4ddd6] bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <p className="font-mono-ui text-[11px] tracking-[2.5px] text-primary">SDC SNIST</p>
            <h1 className="font-grotesk text-xl font-bold text-on-surface">Event admin</h1>
          </div>
          <nav aria-label="Admin" className="flex flex-wrap items-center gap-1 text-sm">
            {ADMIN_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-3.5 py-2 font-medium text-on-surface-variant transition-colors hover:bg-[#fdf0f0] hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
