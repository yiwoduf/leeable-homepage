interface SocialLinks {
  github: string;
  linkedin: string;
  instagram: string;
  email: string;
}

interface ExperienceItem {
  company: string;
  role: string;
  period: string;
  description: string;
  tags: string[];
}

interface SiteData {
  name: string;
  title: string;
  tagline: string;
  statusMessage: string;
  socials: SocialLinks;
  experience: ExperienceItem[];
}

const parseExperience = (raw: string): ExperienceItem[] => {
  try {
    return JSON.parse(raw) as ExperienceItem[];
  } catch {
    return [];
  }
};

export const siteData: SiteData = {
  name: import.meta.env.VITE_NAME ?? "Your Name",
  title: import.meta.env.VITE_TITLE ?? "Developer",
  tagline: import.meta.env.VITE_TAGLINE ?? "",
  statusMessage: import.meta.env.VITE_STATUS_MESSAGE ?? "New portfolio in progress",
  socials: {
    github: import.meta.env.VITE_GITHUB_URL ?? "",
    linkedin: import.meta.env.VITE_LINKEDIN_URL ?? "",
    instagram: import.meta.env.VITE_INSTAGRAM_URL ?? "",
    email: import.meta.env.VITE_EMAIL ?? "",
  },
  experience: parseExperience(import.meta.env.VITE_EXPERIENCE ?? "[]"),
};

export type { SiteData, SocialLinks, ExperienceItem };
