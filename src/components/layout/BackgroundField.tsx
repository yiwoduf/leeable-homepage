import type { BackgroundVariant } from '../../types/design';

/** Fixed full-viewport background field (grid / dots / glow / plain). */
export function BackgroundField({ variant }: { variant: BackgroundVariant }) {
  return <div className="bgfield" data-variant={variant} />;
}
