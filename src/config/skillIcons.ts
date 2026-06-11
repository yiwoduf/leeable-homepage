/**
 * Maps a skill label to its Simple Icons slug. Skills present here render a
 * brand glyph (fetched at runtime, see `useSkillIcons`); skills absent here
 * fall back to a small accent square.
 */
export const SKILL_ICONS: Record<string, string> = {
  TypeScript: 'typescript',
  JavaScript: 'javascript',
  Python: 'python',
  PHP: 'php',
  React: 'react',
  'Next.js': 'nextdotjs',
  'Node.js': 'nodedotjs',
  PostgreSQL: 'postgresql',
  MySQL: 'mysql',
  Supabase: 'supabase',
  Docker: 'docker',
  Git: 'git',
  Vercel: 'vercel',
  'Google Cloud': 'googlecloud',
  Claude: 'claude',
  n8n: 'n8n',
  // Codex and OpenClaw render from CUSTOM_SKILL_ICONS (inline, no fetch) —
  // their marks are missing/blocked on the Simple Icons CDN.
};
