import communityPulseRaw from "../../../community-pulse.json";

// ── Types ──────────────────────────────────────────────────────────────────
type ContributionDay = { date: string; contributionCount: number };
type ContributorEntry = {
  login: string;
  contributionsCollection: {
    contributionCalendar: {
      totalContributions: number;
      weeks: { contributionDays: ContributionDay[] }[];
    };
  };
};

// ── Helpers ────────────────────────────────────────────────────────────────
function contribClass(count: number) {
  if (count === 0) return "bg-white/5";
  if (count <= 3) return "bg-[#a3a6ff]/25";
  if (count <= 8) return "bg-[#a3a6ff]/55";
  return "bg-[#a3a6ff]";
}

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function CommunityPage() {
  const data = communityPulseRaw as ContributorEntry[];

  // ── Aggregate contributions per date ──────────────────────────────────
  const aggregate = new Map<string, number>();
  for (const contributor of data) {
    for (const week of contributor.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        aggregate.set(day.date, (aggregate.get(day.date) ?? 0) + day.contributionCount);
      }
    }
  }

  // Use first contributor's week structure to drive the grid order
  const weeks = data[0].contributionsCollection.contributionCalendar.weeks;

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalContributions = data.reduce(
    (s, c) => s + c.contributionsCollection.contributionCalendar.totalContributions,
    0
  );
  const activeContributors = data.length;
  const activeDays = [...aggregate.values()].filter((v) => v > 0).length;

  // ── Leaderboard (sorted desc) ──────────────────────────────────────────
  const leaderboard = [...data].sort(
    (a, b) =>
      b.contributionsCollection.contributionCalendar.totalContributions -
      a.contributionsCollection.contributionCalendar.totalContributions
  );

  return (
    <main className="relative min-h-screen overflow-x-clip pb-20 pt-28">
      {/* ── Kinetic background orbs ─────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div
          className="kinetic-orb h-[700px] w-[700px] bg-[#6063ee]"
          style={{ top: "-15%", left: "-8%", ["--k-dur" as string]: "15s" }}
        />
        <div
          className="kinetic-orb h-[500px] w-[500px] bg-[#6f00be]"
          style={{ bottom: "-10%", right: "-5%", ["--k-dur" as string]: "20s", animationDelay: "-5s" }}
        />
        <div
          className="kinetic-orb h-[400px] w-[400px] bg-indigo-900"
          style={{ top: "25%", right: "8%", ["--k-dur" as string]: "18s", animationDelay: "-2s" }}
        />
        {/* dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(163,166,255,0.045) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mb-14">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight text-white md:text-6xl">
            Community <span className="gradient-text italic">Pulse</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#adaaaa] md:text-lg">
            A real-time view of the collective effort powering SDC SNIST. Our network is defined
            by contribution, not just presence.
          </p>
        </div>

        {/* ── Bento Grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">

          {/* ── Developer Activity heatmap ── full width ── */}
          <div className="glass-card md:col-span-12 rounded-xl p-6 md:p-8 [box-shadow:0_0_40px_rgba(96,99,238,0.06)]">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="font-headline text-xl font-bold tracking-tight text-[#a3a6ff] md:text-2xl">
                  Developer Activity
                </h2>
                <p className="mt-1 text-sm text-[#adaaaa]">
                  {totalContributions.toLocaleString()} contributions in the last year
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#adaaaa]">
                <span>Less</span>
                <span className="h-3 w-3 rounded-sm bg-white/5" />
                <span className="h-3 w-3 rounded-sm bg-[#a3a6ff]/25" />
                <span className="h-3 w-3 rounded-sm bg-[#a3a6ff]/55" />
                <span className="h-3 w-3 rounded-sm bg-[#a3a6ff]" />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap */}
            <div className="overflow-x-auto">
              <div className="contribution-grid min-w-[780px]">
                {weeks.map((week, wi) =>
                  week.contributionDays.map((day) => {
                    const count = aggregate.get(day.date) ?? 0;
                    return (
                      <div
                        key={day.date}
                        title={`${day.date}: ${count} contribution${count !== 1 ? "s" : ""}`}
                        className={`aspect-square rounded-sm transition-all duration-300 hover:ring-1 hover:ring-[#a3a6ff]/50 ${contribClass(count)}`}
                      />
                    );
                  })
                )}
              </div>
            </div>

            {/* Month labels */}
            <div className="mt-4 flex justify-between text-[10px] font-bold uppercase tracking-widest text-[#adaaaa]">
              {MONTH_LABELS.map((m) => <span key={m}>{m}</span>)}
            </div>
          </div>

          {/* ── Stat: Total Contributions ── */}
          <div className="glass-card md:col-span-4 rounded-xl p-8 flex flex-col justify-between transition-all duration-500 hover:bg-white/5">
            <div className="mb-4 text-3xl text-[#c180ff]">⬡</div>
            <div>
              <div className="font-headline text-4xl font-black text-white">
                {totalContributions.toLocaleString()}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                Total Contributions
              </div>
            </div>
          </div>

          {/* ── Stat: Active Contributors ── */}
          <div className="glass-card md:col-span-4 rounded-xl p-8 flex flex-col justify-between transition-all duration-500 hover:bg-white/5">
            <div className="mb-4 text-3xl text-[#8ce7ff]">◈</div>
            <div>
              <div className="font-headline text-4xl font-black text-white">
                {activeContributors}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                Active Contributors
              </div>
            </div>
          </div>

          {/* ── Stat: Active Days ── */}
          <div className="glass-card md:col-span-4 rounded-xl p-8 flex flex-col justify-between transition-all duration-500 hover:bg-white/5">
            <div className="mb-4 text-3xl text-[#a3a6ff]">◇</div>
            <div>
              <div className="font-headline text-4xl font-black text-white">
                {activeDays}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-widest text-[#adaaaa]">
                Active Days
              </div>
            </div>
          </div>

          {/* ── Spotlight card ── */}
          <div className="glass-card md:col-span-8 rounded-xl overflow-hidden p-1">
            <div className="h-full rounded-[10px] bg-neutral-950/40 backdrop-blur-md p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <span className="mb-4 block text-xs font-bold uppercase tracking-[0.2em] text-[#8ce7ff]">
                  Ecosystem Spotlight
                </span>
                <h3 className="font-headline text-2xl font-bold text-white md:text-3xl">
                  SDC SNIST – Open Builds
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[#adaaaa]">
                  Our community drives open-source projects spanning AI tooling, developer infrastructure,
                  and campus tech. Every commit you make shows up right here in the pulse.
                </p>
                <a
                  href="https://github.com/sdc-india"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#a3a6ff] transition-all hover:gap-4"
                >
                  Explore repositories →
                </a>
              </div>
              <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#6063ee] to-[#6f00be] md:h-56 md:w-56 shrink-0">
                <svg viewBox="0 0 24 24" fill="currentColor" className="relative z-10 h-20 w-20 text-white/80">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* ── Leaderboard ── */}
          <div className="glass-card md:col-span-4 rounded-xl p-8">
            <h3 className="font-headline text-xl font-bold text-white mb-6">Top Contributors</h3>
            <div className="space-y-5">
              {leaderboard.map((contributor, idx) => (
                <div key={contributor.login} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://github.com/${contributor.login}.png?size=80`}
                      alt={`${contributor.login} avatar`}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    />
                    <div>
                      <div className="text-sm font-bold text-white">{contributor.login}</div>
                      <div className="text-xs text-[#adaaaa]">
                        {contributor.contributionsCollection.contributionCalendar.totalContributions.toLocaleString()} contributions
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-black ${idx === 0 ? "text-[#a3a6ff]" : "text-[#adaaaa]"}`}
                  >
                    #{String(idx + 1).padStart(2, "0")}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="https://github.com/sdc-india"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full rounded-lg border border-[#494847] py-3 text-center text-sm font-bold text-white transition-colors hover:bg-white/5"
            >
              View Full Ranks
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}
