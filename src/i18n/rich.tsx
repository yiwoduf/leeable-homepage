import type { ReactNode } from 'react';

/**
 * Lightweight rich-text renderer.
 *
 * Supported markup (processed left-to-right, non-recursive):
 *   \n            → <br />
 *   **word**      → <b>word</b>
 *   *word*        → <span className="kw">word</span>   (script-font accent)
 *
 * No dangerouslySetInnerHTML, no regex backtracking traps.
 * Only call this for trusted strings (portfolio copy / UI strings).
 */
export function renderRich(text: string): ReactNode {
  // Split on the tokens we care about, keeping delimiters in the result.
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|\n)/);

  return parts.map((part, i) => {
    // Content-composite keys: identical parts keep their node across renders,
    // changed parts remount cleanly (index-only keys mismatch on text swaps).
    const key = `${i}:${part}`;

    if (part === '\n') return <br key={key} />;

    if (part.startsWith('**') && part.endsWith('**')) {
      const inner = part.slice(2, -2);
      return <b key={key}>{inner}</b>;
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      const inner = part.slice(1, -1);
      return <span key={key} className="kw">{inner}</span>;
    }

    return part;
  });
}
