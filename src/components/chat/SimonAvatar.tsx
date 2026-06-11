import type { ReactElement, SVGProps } from 'react';

/**
 * Simon's avatar — a geometric lab-style robot mark. Rounded-square head,
 * two circular eyes, and a small antenna. Strokes use currentColor so it
 * inherits from the parent element's color (accent-ink on the launcher,
 * accent on message rows).
 */
export function SimonAvatar(props: SVGProps<SVGSVGElement>): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      {...props}
    >
      {/* Antenna */}
      <line x1="16" y1="4" x2="16" y2="8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="16" cy="3.2" r="1.4" fill="currentColor" />

      {/* Head — rounded square */}
      <rect x="6" y="8" width="20" height="18" rx="4" stroke="currentColor" strokeWidth="1.8" />

      {/* Eyes */}
      <circle cx="11.5" cy="16" r="2.2" fill="currentColor" />
      <circle cx="20.5" cy="16" r="2.2" fill="currentColor" />

      {/* Mouth / visor line */}
      <path
        d="M11.5 21.5 Q16 23.5 20.5 21.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
