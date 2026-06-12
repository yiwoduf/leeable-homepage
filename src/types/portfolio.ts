/**
 * Content model for the portfolio. The single content object lives in
 * `src/data/portfolio.ts` and is typed against `PortfolioData`.
 */

export interface Identity {
  name: string;
  nickname: string;
  role: string;
  tagline: string;
  location: string;
  /** Path to the résumé PDF, served from `public/`. */
  resume: string;
  email: string;
  github: string;
  githubLabel: string;
  linkedin: string;
  linkedinLabel: string;
  instagram: string;
  x: string;
}

export interface Fact {
  k: string;
  v: string;
}

export interface Stat {
  n: string;
  l: string;
}

export interface About {
  lead: string;
  body: string;
  facts: Fact[];
  stats: Stat[];
}

export interface Experience {
  role: string;
  sub: string;
  org: string;
  period: string;
  /** Marks the current role (adds the pulsing "now" ring on the timeline). */
  now?: boolean;
  points: string[];
  tags: string[];
}

export type SolutionStatus = 'live' | 'in-progress';

export interface FlowNode {
  k: string;
  d: string;
}

export interface Metric {
  n: string;
  l: string;
}

export interface Solution {
  title: string;
  codename: string;
  status: SolutionStatus;
  blurb: string;
  problem: string;
  /** The shipped outcome (live) or intended outcome (in-progress). */
  solution: string;
  role: string;
  flow: FlowNode[];
  metrics: Metric[];
}

export interface Project {
  name: string;
  desc: string;
  stack: string[];
  /** External URL, or `null` when the project isn't public yet. */
  link: string | null;
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface PortfolioData {
  identity: Identity;
  about: About;
  experience: Experience[];
  solutions: Solution[];
  projects: Project[];
  skills: SkillGroup[];
}
