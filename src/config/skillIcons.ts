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
  // Codex → OpenAI's mark (recolored to follow the theme; see ADAPT in useSkillIcons).
  Codex: 'openai',
};
