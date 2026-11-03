export type RecruitmentRoleId =
  | "documentation"
  | "designing"
  | "tech"
  | "organizing"
  | "publicity";

export type ChallengeKind = "writing" | "choice" | "scenario";

export type RecruitmentRole = {
  id: RecruitmentRoleId;
  title: string;
  tagline: string;
  description: string;
  responsibilities: string[];
  accent: string;
  challenge: {
    title: string;
    prompt: string;
    kind: ChallengeKind;
    /** For choice challenges */
    options?: string[];
    placeholder?: string;
    hint?: string;
  };
};

export const RECRUITMENT_ROLES: RecruitmentRole[] = [
  {
    id: "documentation",
    title: "Documentation",
    tagline: "Clarity in every record",
    description:
      "Keep SDC’s knowledge base sharp — reports, notes, and docs that help the whole team move faster.",
    responsibilities: [
      "Maintain reports, meeting notes, and documents",
      "Structure event summaries and handoff docs",
      "Keep wikis and shared drives organized",
    ],
    accent: "#8c0f1c",
    challenge: {
      title: "Meeting notes sprint",
      prompt:
        "A 20-minute standup covered: Launchpad venue booking, poster deadline Friday, and two new workshop ideas (Git & AI). Write a crisp 3-bullet meeting summary a teammate could act on.",
      kind: "writing",
      placeholder: "• …\n• …\n• …",
      hint: "Keep it scannable — action, owner vibe, and deadline where it matters.",
    },
  },
  {
    id: "designing",
    title: "Designing",
    tagline: "Make SDC look unforgettable",
    description:
      "Craft the visual language of SDC — posters, banners, UI assets, and social creatives that stop the scroll.",
    responsibilities: [
      "Design posters, banners, and UI assets",
      "Create social media creatives",
      "Keep brand consistency across channels",
    ],
    accent: "#a51b28",
    challenge: {
      title: "Poster headline lab",
      prompt:
        "SDC is promoting a campus hackathon called “CodeForge”. Pick a visual mood and write one bold poster headline (max 8 words).",
      kind: "choice",
      options: ["Neon cyber / high contrast", "Clean editorial / minimal", "Bold campus energy / loud type"],
      placeholder: "Your headline…",
      hint: "Headline should feel shoutable from a hallway poster.",
    },
  },
  {
    id: "tech",
    title: "Tech Team",
    tagline: "Ship what the community runs on",
    description:
      "Build and maintain SDC’s digital spine — website features, fixes, and technical support for events.",
    responsibilities: [
      "Website development and feature implementation",
      "Bug fixes and performance improvements",
      "Technical support for events and tooling",
    ],
    accent: "#b21725",
    challenge: {
      title: "Debug & decide",
      prompt:
        "The Join page button stays on “Processing…” and never opens checkout. What’s the most likely first place you’d check?",
      kind: "choice",
      options: [
        "Browser console + network tab for the create-order API",
        "Rewrite the entire homepage",
        "Delete node_modules and hope",
        "Ignore it — users will refresh",
      ],
      placeholder: "Optional: how would you fix it in one sentence?",
      hint: "Think like a teammate triaging production.",
    },
  },
  {
    id: "organizing",
    title: "Organizing",
    tagline: "Turn plans into experiences",
    description:
      "Own the logistics that make events land — planning, coordination, and smooth execution on the day.",
    responsibilities: [
      "Event planning and timeline ownership",
      "Coordination across teams and venues",
      "On-ground execution and contingency handling",
    ],
    accent: "#c81f2f",
    challenge: {
      title: "Run-of-show challenge",
      prompt:
        "You have 10 days to run a 2-hour workshop for 80 students. List your top 4 steps in order (from now → event day).",
      kind: "writing",
      placeholder: "1. …\n2. …\n3. …\n4. …",
      hint: "Include people, place, promo, and day-of flow.",
    },
  },
  {
    id: "publicity",
    title: "Publicity",
    tagline: "Get the campus talking",
    description:
      "Amplify every SDC moment — promotions, social presence, and outreach that fills rooms with the right people.",
    responsibilities: [
      "Event promotion across campus channels",
      "Social media management and storytelling",
      "Student outreach and partnership nudges",
    ],
    accent: "#d9202f",
    challenge: {
      title: "Caption drop",
      prompt:
        "Write an Instagram caption (2–4 lines) for SDC’s Launchpad session covering Web, AI/ML, UI/UX, and Data Analytics. End with a soft CTA.",
      kind: "writing",
      placeholder: "Draft your caption…",
      hint: "Sound human, not brochure-y. One emoji max if you use any.",
    },
  },
];

export function getRecruitmentRole(id: RecruitmentRoleId) {
  return RECRUITMENT_ROLES.find((role) => role.id === id);
}
