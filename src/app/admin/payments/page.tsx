import MembershipSettingsPanel from "@/components/admin/MembershipSettingsPanel";
import { requireAdminPage } from "@/lib/admin-auth";

export const metadata = {
  title: "Payments | Admin | SDC SNIST",
  robots: { index: false, follow: false },
};

export default async function AdminPaymentsPage() {
  await requireAdminPage("/admin/payments");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-grotesk text-2xl font-bold text-on-surface">Payment management</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Membership fee and payment settings.</p>
      </div>
      <MembershipSettingsPanel />
    </div>
  );
}
