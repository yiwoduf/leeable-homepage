import { glowHandlers } from '../../lib/cardGlow';

/** A single metric tile (big number + label) with pointer glow. */
export function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div className="stat glow-p" {...glowHandlers}>
      <div className="n">{n}</div>
      <div className="l">{l}</div>
    </div>
  );
}
