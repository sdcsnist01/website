export type TeamMember = {
  initials: string;
  name: string;
  role: string;
  bio: string;
};

export type PartnerLogo = {
  src: string;
  alt: string;
};

export type ImpactStat = {
  value: string;
  label: string;
};

export type AboutPageContent = {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  mission: string;
  vision: string;
  foundingStory: string;
  teamIntro: string;
};
