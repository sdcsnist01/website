import BecomeMemberForm from "@/components/membership/BecomeMemberForm";
import RecruitmentFlow from "@/components/recruitment/RecruitmentFlow";
import SectionHeader from "@/components/ui/SectionHeader";
import { getMembershipSettings } from "@/lib/membership-settings";
import { createAdminClient } from "@/lib/supabase/admin";

// The membership fee is read from the database, so it must not be prerendered at build time.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Recruitment | SDC SNIST",
  description:
    "Apply to Documentation, Designing, Tech Team, Organizing, or Publicity — unlock your recruitment challenge and join SDC SNIST.",
};

export default async function JoinPage() {
  const settings = await getMembershipSettings(createAdminClient());

  return (
    <main className="relative overflow-x-clip bg-background pb-16 pt-24 font-body text-on-surface sm:pt-28">
      <section id="membership" aria-labelledby="membership-heading" className="relative mx-auto max-w-3xl scroll-mt-28 px-4 sm:px-6">
        <SectionHeader
          align="center"
          eyebrow="MEMBERSHIP"
          title={<span id="membership-heading">Become a member</span>}
          subtitle={`Create your account, get a unique 6-digit member ID based on your joining year (2023→2331…, 2024→2431…), and unlock workshops, hackathons, and campus events. ₹${settings.feeInr}/year.`}
        />

        <BecomeMemberForm feeInr={settings.feeInr} paymentsEnabled={settings.paymentsEnabled} />
      </section>

      <section aria-label="Recruitment" className="relative mx-auto mt-16 max-w-7xl px-4 sm:mt-24 sm:px-6 md:px-8">
        <RecruitmentFlow />
      </section>
    </main>
  );
}
