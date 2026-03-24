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
      description: "Building enterprise HR and payroll solutions as a fullstack developer, leveraging agentic AI tools to accelerate development workflows.",
      tags: ["React", ".NET", "PHP", "SQL", "Agentic AI", "Enterprise"],
    },
    {
      company: "Freelance",
      role: "Fullstack Developer",
      period: "2023 - 2024",
      description: "Delivered end-to-end web applications and built AI-powered tools — including custom agents, skills, and automated workflows using LLMs.",
      tags: ["Next.js", "React", "Supabase", "Agentic AI", "LLM Orchestration", "Claude Code"],
    },
  ],
};

export type { SiteData, SocialLinks, ExperienceItem };
