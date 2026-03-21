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

export const siteData: SiteData = {
  name: "Jaeyol (Peter) Lee",
  title: "Fullstack Developer",
  tagline: "Building products with AI",
  statusMessage: "New portfolio in progress",
  socials: {
    github: "https://github.com/yiwoduf",
    linkedin: "https://linkedin.com/in/yiwoduf",
    instagram: "https://instagram.com/o2.27.o2",
    email: "yiwoduf@gmail.com",
  },
  experience: [
    {
      company: "Paycom",
      role: "Software Developer",
      period: "2024 - Present",
      description: "Building enterprise HR and payroll solutions as a fullstack developer.",
      tags: ["React", ".NET", "SQL", "Enterprise"],
    },
    {
      company: "Freelance",
      role: "Fullstack Developer",
      period: "2023 - 2024",
      description: "Delivered end-to-end web applications for clients, focusing on modern UI/UX and rapid iteration.",
      tags: ["Next.js", "React", "Tailwind", "Supabase"],
    },
  ],
};

export type { SiteData, SocialLinks, ExperienceItem };
