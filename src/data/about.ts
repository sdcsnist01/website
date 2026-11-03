import type { AboutPageContent, ImpactStat, PartnerLogo, TeamMember } from "@/types/about";

export const aboutPageContent: AboutPageContent = {
  heroTag: "OUR STORY",
  heroTitle: "About SDC SNIST",
  heroSubtitle:
    "Empowering students to learn, build, and grow through technology. Bridging the gap between academic learning and industry requirements.",
  mission:
    "To bridge the gap between academic learning and industry requirements by providing a platform for students to learn, build, and grow together.",
  vision:
    "To become SNIST's largest and most impactful student developer community, fostering innovation and continuous learning.",
  foundingStory:
    "SDC SNIST started with a simple belief: that students have immense potential to build world-class technology when given the right resources, mentorship, and community. Founded in 2021 by a small group of passionate tech enthusiasts, it quickly evolved from local meetups into a thriving campus movement. Today, we empower thousands of students to bridge the gap between theory and actual building.",
  teamIntro: "Meet the visionary leaders and passionate members driving our mission.",
};

export const boardMembersStub: TeamMember[] = [
  {
    initials: "RS",
    name: "Riya Sharma",
    role: "Executive Board Member",
    bio: "Strategic leader focused on scaling SDC chapters and building strong campus-industry connections.",
  },
  {
    initials: "VK",
    name: "Vikram Khanna",
    role: "Board Strategy Member",
    bio: "Leads long-term planning and governance, ensuring each initiative aligns with the community vision.",
  },
  {
    initials: "NA",
    name: "Neha Arora",
    role: "Programs Board Member",
    bio: "Designs mentorship programs and high-impact events that help students convert ideas into products.",
  },
  {
    initials: "AJ",
    name: "Aarav Jain",
    role: "Board Operations Member",
    bio: "Improves execution workflows and drives collaboration between technical and non-technical teams.",
  },
];

export const techLeadsStub: TeamMember[] = [
  {
    initials: "AP",
    name: "Arjun Patel",
    role: "Lead Developer",
    bio: "Builds scalable learning tools and sets engineering standards for community platforms.",
  },
  {
    initials: "MD",
    name: "Meera Desai",
    role: "Engineering Lead",
    bio: "Drives architecture decisions and mentors contributors on quality, performance, and shipping fast.",
  },
  {
    initials: "RK",
    name: "Rohit Kulkarni",
    role: "DevOps Lead",
    bio: "Owns CI/CD and reliability, helping projects ship quickly with stable infrastructure.",
  },
  {
    initials: "SN",
    name: "Sara Nair",
    role: "AI Track Lead",
    bio: "Leads AI learning paths and builds applied projects around ML and intelligent systems.",
  },
];

export const coreMembersStub: TeamMember[] = [
  {
    initials: "KS",
    name: "Karan Singh",
    role: "Frontend Developer",
    bio: "Crafts accessible interfaces and interactive experiences for workshops, dashboards, and event pages.",
  },
  {
    initials: "SR",
    name: "Sneha Reddy",
    role: "Community Manager",
    bio: "Coordinates chapter engagement and keeps communication flowing across members, mentors, and partners.",
  },
  {
    initials: "AM",
    name: "Aman Malik",
    role: "Backend Developer",
    bio: "Builds APIs and automation pipelines that support registrations, reporting, and internal tools.",
  },
  {
    initials: "PI",
    name: "Priya Iyer",
    role: "Design Lead",
    bio: "Shapes product storytelling and visual systems to keep SDC experiences memorable and consistent.",
  },
  {
    initials: "DK",
    name: "Dev Khurana",
    role: "Event Coordinator",
    bio: "Plans and executes coding events while ensuring smooth speaker and participant experiences.",
  },
  {
    initials: "HM",
    name: "Harini Menon",
    role: "Content Lead",
    bio: "Builds educational content and learning series to keep member growth consistent.",
  },
];

export const partnerLogosStub: PartnerLogo[] = [
  { src: "/about/partners/microsoft-learn.svg", alt: "Microsoft Learn" },
  { src: "/about/partners/iete.svg", alt: "IETE" },
  { src: "/about/partners/code-sprint.svg", alt: "Code Sprint" },
  { src: "/about/partners/hack-this-fall.svg", alt: "Hack This Fall" },
  { src: "/about/partners/gdsc-wow.svg", alt: "Google Developer Student Clubs WOW" },
  { src: "/about/partners/edventure.svg", alt: "EdVenture Park" },
  { src: "/about/partners/pycon.svg", alt: "PyCon India Hyderabad 2023" },
  { src: "/about/partners/st.svg", alt: "St" },
  { src: "/about/partners/talentmapp.svg", alt: "Talentmapp" },
  { src: "/about/partners/ecell.svg", alt: "E-Cell" },
];

export const impactStatsStub: ImpactStat[] = [
  { value: "50+", label: "Events Hosted" },
  { value: "5000+", label: "Students Reached" },
  { value: "120+", label: "Workshops Conducted" },
];
