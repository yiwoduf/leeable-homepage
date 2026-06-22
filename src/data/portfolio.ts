import type { PortfolioData } from '../types/portfolio';

/** Portfolio content — single source of truth. */
export const portfolio: PortfolioData = {
  identity: {
    name: 'Jaeyol Lee',
    nickname: 'Peter',
    role: 'AI Product Engineer',
    tagline: 'I build **multi-agent AI systems** that automate real-world workflows end to end.',
    location: 'Dallas–Fort Worth, TX',
    resume: 'Jaeyol-Lee-Resume.pdf',
    email: 'yiwoduf@gmail.com',
    github: 'https://github.com/yiwoduf',
    githubLabel: 'github.com/yiwoduf',
    linkedin: 'https://linkedin.com/in/yiwoduf',
    linkedinLabel: 'linkedin.com/in/yiwoduf',
    x: 'https://x.com/yiwoduf',
  },

  about: {
    lead: 'About 2 years shipping production software at a publicly traded HR/payroll SaaS company — now building AI products end to end.',
    body: 'I design and deploy multi-agent systems that automate real-world workflows: identifying where agents add leverage, then shipping autonomous pipelines that run unattended. Operator/founder mindset, self-taught since age 12, with strong system-design instincts.',
    facts: [
      { k: 'Based in', v: 'Dallas–Fort Worth, TX' },
      { k: 'Languages', v: 'English · Korean' },
      { k: 'Education', v: 'B.S. Computer Science, University of Kansas' },
      { k: 'Focus', v: 'Multi-agent systems · Workflow automation' },
    ],
    stats: [
      { n: '5+', l: 'agents orchestrated' },
      { n: '2,259+', l: 'LLM evaluations' },
      { n: '~2 yrs', l: 'production software' },
      { n: '24/7', l: 'autonomous' },
    ],
  },

  experience: [
    {
      role: 'Independent AI Product Engineer',
      sub: 'Building in Public',
      org: 'Remote',
      period: 'Apr 2026 — Present',
      now: true,
      points: [
        'Designed and built a production multi-agent AI system (orchestrator → specialist hierarchy) on the Pi/OpenClaw runtime, with a plugin-based harness layer (PreToolUse/PostToolUse hooks) and MCP integrations (Notion, Google Workspace).',
        'Shipped a fully autonomous pipeline that crawls, scores, and routes job postings daily — 2,259+ processed to date with zero manual intervention.',
        'Built News HQ — a self-hosted, four-agent news intelligence system that collects, de-duplicates, analyzes, and reports ~500 articles/day from 10+ sources into a vector knowledge base, with a RAG chat to query it — running unattended daily.',
      ],
      tags: ['Multi-agent', 'OpenClaw', 'n8n', 'MCP', 'Supabase', 'RAG'],
    },
    {
      role: 'Software Developer II → III',
      sub: '',
      org: 'Paycom · Irving, TX',
      period: 'Nov 2024 — May 2026',
      points: [
        'Promoted to Software Developer III ahead of peers and earned a performance bonus for consistently delivering high-impact work — as the most junior member of the team; served as Lead Dev / Lead Tester on 20+ test-execution and 200+ development tickets.',
        'Designed and shipped an end-to-end system automating jurisdiction selection from candidate data — owning the database schema, third-party API integration, and a new data model across 14 stories.',
        'Delivered a multi-module compliance feature end to end under a 3-week deadline, designing a progressive-disclosure UX for complex eligibility flows.',
        'Built an internal harness for AI-assisted development in a security-restricted environment, standardizing safe AI coding workflows across the team.',
      ],
      tags: ['PHP', 'React', 'MySQL', 'System design'],
    },
    {
      role: 'Research Assistant — Web Developer',
      sub: '',
      org: 'University of Kansas · Lawrence, KS',
      period: 'Jan 2023 — Aug 2024',
      points: [
        'Rapidly built and iterated MVP healthcare web apps for diabetes management with a UI/UX faculty researcher — turning real patient-survey feedback into user-focused interfaces through design thinking (Next.js, React, Vercel).',
      ],
      tags: ['Next.js', 'React', 'Vercel'],
    },
    {
      role: 'IT Student Technician — Team Lead',
      sub: '',
      org: 'University of Kansas · Lawrence, KS',
      period: 'Jul 2022 — Jul 2024',
      points: [
        'Led a student technician team supporting campus IT operations, hardware provisioning, and end-user troubleshooting.',
      ],
      tags: ['Team lead', 'Support'],
    },
  ],

  solutions: [
    {
      title: 'Autonomous Job-Search Pipeline',
      codename: 'Career HQ',
      status: 'live',
      blurb: 'A self-running pipeline that crawls, scores, and routes job postings every morning — no human in the loop.',
      problem: "After a layoff, manual job search was slow and opportunities slipped through the cracks. Searching, filtering, and tailoring applications by hand didn't scale.",
      solution: 'A self-running multi-agent pipeline that scores and routes only the best-fit roles into a daily digest — turning hours of manual searching into minutes of review.',
      role: 'System design · agent orchestration · TypeScript plugins · harness engineering',
      flow: [
        { k: 'Apify', d: 'Crawl postings' },
        { k: 'n8n', d: '7 AM cron trigger' },
        { k: 'Supabase', d: 'Store + dedupe' },
        { k: 'LLM scoring', d: 'Rank by fit' },
        { k: 'Notion', d: 'Pipeline board' },
        { k: 'position-analyst', d: 'Deep fit analysis' },
        { k: 'Discord', d: 'Alert + digest' },
      ],
      metrics: [
        { n: '2,259+', l: 'LLM evaluations' },
        { n: 'Daily', l: 'unattended runs' },
        { n: 'Auto', l: 'résumé + cover-letter tailoring' },
      ],
    },
    {
      title: 'Autonomous News Intelligence',
      codename: 'News HQ',
      status: 'live',
      blurb: "A self-hosted multi-agent newsroom — it collects, de-duplicates, analyzes, and reports the day's news every morning, then answers questions about it over RAG.",
      problem: "Following AI, tech, and market news by hand is slow and lossy — the stories that matter scatter across dozens of feeds and slip through. The goal: a trustworthy daily briefing that's assembled, stored, and queryable with no human in the loop.",
      solution: "A self-hosted newsroom of four cooperating agents — curator, analyst, reporter, and a RAG chat — runs unattended every day: it pulls ~500 articles from 10+ trusted sources, de-duplicates them by meaning with vector search, writes deep analyses, stores everything in a pgvector knowledge base and Notion, and ships a categorized briefing to Discord and iMessage. The chat agent then answers questions over the same vectors.",
      role: 'System design · multi-agent orchestration · race-free parallel execution · harness + prompt engineering (analysis quality held while cutting API cost) · self-healing recovery',
      flow: [
        { k: 'RSS ×10+',    d: 'Trusted sources' },
        { k: 'n8n',         d: 'Fetch + embed (cron)' },
        { k: 'Supabase',    d: 'Store + pgvector' },
        { k: 'Curator',     d: 'Classify + dedupe' },
        { k: 'Analysts ×3', d: 'Parallel deep analysis' },
        { k: 'Reporter',    d: 'Notion · Discord · iMessage' },
        { k: 'RAG chat',    d: 'Vector retrieval Q&A' },
      ],
      metrics: [
        { n: '~500/day', l: 'articles triaged unattended' },
        { n: '2×',      l: 'faster — parallel agents' },
        { n: '10+',      l: 'sources · 9 categories' },
        { n: 'Auto',     l: 'self-healing recovery' },
      ],
    },
    {
      title: 'Self-Tuning Meta Agent',
      codename: 'Closed Loop',
      status: 'in-progress',
      blurb: 'A meta layer over the agent fleet that measures its own behavior and tunes its parameters and prompts from live metrics and human feedback.',
      problem: 'The pipelines run unattended, but a human still tunes them — adjusting thresholds, curation criteria, and prompts by hand whenever quality drifts or volume spikes. The goal: close that loop so the system observes its own behavior and makes small, bounded adjustments without a person watching.',
      solution: "A planned meta layer with three concrete mechanisms. (1) Self-observation — log daily signals (intake volume, analysis completion, deadline adherence, dedup accuracy, RAG similarity spread) and act on thresholds automatically, e.g. trip the circuit breaker when intake spikes. (2) A quality feedback loop — thumbs-up/down on reports and chat answers feeds back into the curator's Fit criteria and prompts, so curation sharpens over time. (3) A meta-agent that periodically reads the other agents' logs and failures, diagnoses where a prompt keeps leaking, and proposes the fix. Self-tuning within guardrails, not self-rewriting.",
      role: 'Designing the measurement layer and guardrails — turning hand-tuning into codified, bounded self-adjustment, built on signals the live News HQ pipeline already emits.',
      flow: [
        { k: 'Observe',    d: 'Log fleet metrics' },
        { k: 'Detect',     d: 'Threshold checks' },
        { k: 'Adjust',     d: 'Bounded self-tune' },
        { k: 'Feedback',   d: 'Ratings tune Fit' },
        { k: 'Meta-agent', d: 'Diagnose + propose' },
      ],
      metrics: [],
    },
  ],

  projects: [
    {
      name: 'notion-quest-board',
      desc: 'A to-do web app that wraps a Notion database as a game-like quest board — tasks become quests with state synced through the Notion API.',
      stack: ['Next.js', 'TypeScript', 'Notion API'],
      link: 'https://todo.leeable.dev/',
      live: true,
    },
    {
      name: 'OpenClaw Hook Harness Plugin',
      desc: 'A TypeScript harness plugin for the OpenClaw runtime — PreToolUse / PostToolUse hooks that enforce safe, observable agent tool-calls.',
      stack: ['TypeScript', 'OpenClaw', 'Hooks'],
      link: 'https://github.com/yiwoduf/openclaw-hook-harness',
    },
    {
      name: 'OpenClaw Webhook Trigger Harness Plugin',
      desc: 'Replaces native web-fetch with a harnessed, tool-callable webhook trigger — only allowlisted agents can hit allowlisted URLs, so prompt injection or a model misjudgment can never fetch the open web.',
      stack: ['TypeScript', 'OpenClaw', 'AI Security'],
      link: 'https://github.com/yiwoduf/openclaw-webhook-trigger',
    },
    {
      name: 'OpenClaw News RAG Plugin',
      desc: 'An OpenClaw tool plugin that gives a conversational agent semantic search over the News HQ vector store — retrieval-as-a-tool. It embeds the query (OpenAI, 1536-d), runs a vector cosine search with an optional recency filter, and returns ranked, fully-sourced context — SQL and raw vectors stay sealed inside the tool.',
      stack: ['TypeScript', 'OpenClaw', 'Vector DB', 'RAG'],
      link: null,
    },
    {
      name: 'Workflow Diagram Generator',
      desc: 'Architecture and workflow diagrams authored by AI instead of dragged by hand in Figma. Describe a flow in plain language and the assistant writes a declarative spec that renders through a built-in design system, then exports pixel-perfect PNGs or looping GIFs — clone it, open Claude Code, and ask for the diagram you want.',
      stack: ['Vite', 'Canvas / GIF', 'AI-native'],
      link: 'https://github.com/yiwoduf/workflow-diagram-generator',
    },
    {
      name: 'Argon MS — Online Game Server',
      desc: 'A from-scratch online game server I built and ran as a teenager — Java server backend, MySQL/MariaDB database, JavaScript NPC scripting, and client reverse engineering. Handled server ops, content, and live debugging end to end.',
      stack: ['Java', 'MySQL', 'JavaScript', 'Reverse Engineering'],
      link: 'https://github.com/yiwoduf/Argon-MS',
    },
    {
      name: 'leeable.dev — Portfolio',
      desc: 'This site — a multilingual (EN/KO) portfolio with an AI assistant chatbot, dark mode, and a prompt-injection-resistant system prompt. Built with React, TypeScript, and Vite.',
      stack: ['React', 'TypeScript', 'i18n', 'AI Chatbot'],
      link: 'https://github.com/yiwoduf/leeable-homepage',
    },
  ],

  skills: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'Java'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'TailwindCSS'] },
    { group: 'Backend & Data', items: ['Node.js', 'PostgreSQL', 'MySQL', 'Supabase', 'MongoDB'] },
    { group: 'AI & Agents', items: ['Claude', 'MCP', 'RAG', 'CAG', 'n8n', 'OpenClaw', 'OpenCode', 'Codex', 'Ollama'] },
    { group: 'Infra & Tools', items: ['Docker', 'Git', 'Vercel', 'Google Cloud'] },
  ],
};
