import type { ReactElement, ReactNode } from 'react';

/** Known card token keys. */
type CardKey = 'email' | 'github' | 'linkedin' | 'resume';

interface CardDef {
  label: string;
  href: string;
  /** Open in new tab (false for mailto). */
  newTab: boolean;
  icon: ReactElement;
}

/** Small inline SVG icons for each card type. currentColor inherits from parent. */
const MailIcon = (): ReactElement => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="1.5" y="3" width="13" height="10" rx="1.5" />
    <path d="m2 4 6 5 6-5" />
  </svg>
);

const GithubIcon = (): ReactElement => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 1a7 7 0 0 0-2.21 13.64c.35.06.48-.15.48-.34v-1.2c-1.94.42-2.35-.94-2.35-.94-.32-.8-.77-1.02-.77-1.02-.63-.43.05-.42.05-.42.7.05 1.07.72 1.07.72.63 1.07 1.64.76 2.04.58.06-.45.25-.76.45-.94-1.55-.18-3.18-.78-3.18-3.43 0-.76.27-1.38.71-1.86-.07-.18-.31-.88.07-1.84 0 0 .59-.19 1.93.72A6.6 6.6 0 0 1 8 4.6c.55.002 1.1.075 1.65.22 1.34-.91 1.93-.72 1.93-.72.38.96.14 1.66.07 1.84.44.48.71 1.1.71 1.86 0 2.66-1.63 3.25-3.19 3.42.25.22.48.65.48 1.31v1.94c0 .19.13.4.48.34A7 7 0 0 0 8 1Z" />
  </svg>
);

const LinkedinIcon = (): ReactElement => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M13.63 13.63h-2.37V9.92c0-.88-.02-2.02-1.23-2.02-1.23 0-1.42.96-1.42 1.96v3.77H6.24V6h2.28v1.04h.03c.32-.6 1.1-1.23 2.25-1.23 2.4 0 2.84 1.58 2.84 3.64v4.18ZM3.56 4.95a1.38 1.38 0 1 1 0-2.76 1.38 1.38 0 0 1 0 2.76ZM4.75 13.63H2.37V6h2.38v7.63ZM14.82 0H1.17C.53 0 0 .52 0 1.16v13.68C0 15.48.53 16 1.17 16h13.65c.65 0 1.18-.52 1.18-1.16V1.16C16 .52 15.47 0 14.82 0Z" />
  </svg>
);

const ResumeIcon = (): ReactElement => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 2H4a1.5 1.5 0 0 0-1.5 1.5v9A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5V6Z" />
    <path d="M9 2v4h4M5.5 9h5M5.5 11.5h3" />
  </svg>
);

/** Map of all supported card tokens. */
const CARD_MAP: Record<CardKey, CardDef> = {
  email: {
    label: 'Email',
    href: 'mailto:yiwoduf@gmail.com',
    newTab: false,
    icon: <MailIcon />,
  },
  github: {
    label: 'GitHub',
    href: 'https://github.com/yiwoduf',
    newTab: true,
    icon: <GithubIcon />,
  },
  linkedin: {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/yiwoduf',
    newTab: true,
    icon: <LinkedinIcon />,
  },
  resume: {
    label: 'Résumé',
    href: '/Jaeyol-Lee-Resume.pdf',
    newTab: true,
    icon: <ResumeIcon />,
  },
};

/** Renders a compact interactive card chip for a known token. */
function LinkCard({ cardKey }: { cardKey: CardKey }): ReactElement {
  const def = CARD_MAP[cardKey];
  return (
    <a
      className="chat-link-card"
      href={def.href}
      {...(def.newTab
        ? { target: '_blank', rel: 'noopener noreferrer' }
        : {})}
    >
      <span className="chat-link-card-icon">{def.icon}</span>
      <span className="chat-link-card-label">{def.label}</span>
    </a>
  );
}

/** Regex that matches a complete [[card:KEY]] token. */
const TOKEN_RE = /\[\[card:(email|github|linkedin|resume)\]\]/g;

/**
 * Regex that matches a trailing INCOMPLETE token fragment at the end of a
 * string, e.g. "[[" or "[[card" or "[[card:git". Used to hide partial tokens
 * during streaming so they don't flash as raw text.
 */
const TRAILING_PARTIAL_RE = /\[\[(?:card(?::(?:email|github|linkedin|resume)?)?)?$/;

/**
 * Parse assistant message content into an array of text nodes and LinkCard
 * elements. Unknown tokens are left as plain text. Trailing partial tokens
 * are stripped (streaming safety).
 */
export function parseAssistantContent(raw: string): ReactNode[] {
  // Strip trailing partial token during streaming
  const text = raw.replace(TRAILING_PARTIAL_RE, '');

  const nodes: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  TOKEN_RE.lastIndex = 0;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) {
      nodes.push(before);
    }
    const key = match[1] as CardKey;
    nodes.push(<LinkCard key={`card-${match.index}`} cardKey={key} />);
    lastIndex = TOKEN_RE.lastIndex;
  }

  const remainder = text.slice(lastIndex);
  if (remainder) {
    nodes.push(remainder);
  }

  return nodes;
}
