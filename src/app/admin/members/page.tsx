import { createClient } from "@/lib/supabase/server";
import type { SdcMemberRow } from "@/lib/membership";

export default async function AdminMembersPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sdc_members")
    .select("*")
    .order("membership_year", { ascending: false })
    .order("created_at", { ascending: false });

  const members = (data ?? []) as SdcMemberRow[];
  const cohortCounts = members.reduce<Record<number, number>>((acc, m) => {
    const year = m.membership_year ?? 2026;
    acc[year] = (acc[year] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Members</h2>
        <p className="mt-1 text-on-surface-variant">{members.length} registrations</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(cohortCounts)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, count]) => (
              <span
                key={year}
                className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
              >
                {year} batch · {count}
              </span>
            ))}
        </div>
      </div>

      {error ? (
        <p className="rounded-xl border border-primary/30 bg-[#fdf0f0] px-4 py-3 text-sm text-[#7a1220]">{error.message}</p>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-[#e4ddd6]">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-high text-on-surface-variant">
            <tr>
              <th className="px-4 py-3 font-semibold">Member ID</th>
              <th className="px-4 py-3 font-semibold">Cohort</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Roll</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="border-t border-outline-variant/10">
                <td className="px-4 py-3 font-mono text-primary">{m.member_id}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {m.membership_year ?? 2026}
                  </span>
                </td>
                <td className="px-4 py-3 text-on-surface">{m.full_name}</td>
                <td className="px-4 py-3 text-on-surface-variant">{m.roll_number}</td>
                <td className="px-4 py-3 text-on-surface-variant">{m.email}</td>
                <td className="px-4 py-3 text-on-surface-variant">{m.phone}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      m.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-[#efeae4] text-on-surface-variant"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!members.length ? <p className="px-4 py-8 text-center text-on-surface-variant">No members yet.</p> : null}
      </div>
    </div>
  );
}
