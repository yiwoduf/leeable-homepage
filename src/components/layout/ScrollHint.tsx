/**
 * Pull indicator at the top & bottom centre. Pure markup — driven entirely by
 * document-root state from useSectionSnap (wheel & touch alike): `data-pull` +
 * `--pull` + `--pull-label` stretch & brighten the bar in the pull direction and
 * fade in the destination section's name beside it.
 */
export function ScrollHint() {
  return (
    <div className="scroll-hint" aria-hidden="true">
      <span className="hint-label up" />
      <span className="scroll-hint-bar up">
        <i className="fill" />
      </span>
      <span className="scroll-hint-bar down">
        <i className="fill" />
      </span>
      <span className="hint-label down" />
    </div>
  );
}
