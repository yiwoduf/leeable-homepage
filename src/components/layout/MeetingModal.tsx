import { useEffect, useRef, useState } from 'react';
import { useI18n } from '../../i18n';
import { MEETING_URL } from '../../config/meeting';
import { Icon } from '../ui';

/** Mounted only while open. Native dialog makes the page behind it inert. */
export function MeetingModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const s = t.meeting;
  const embedUrl = new URL(MEETING_URL);
  embedUrl.searchParams.set('embed_domain', window.location.hostname);
  embedUrl.searchParams.set('embed_type', 'Inline');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current!;
    const previousFocus = document.activeElement;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    dialog.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus({ preventScroll: true });
      }
    };
  }, []);

  useEffect(() => {
    if (loaded) return;
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(timer);
  }, [loaded]);

  return (
    <dialog
      ref={dialogRef}
      className="meeting-dialog"
      data-overlay=""
      aria-labelledby="meeting-title"
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        if (event.clientX < rect.left || event.clientX > rect.right ||
            event.clientY < rect.top || event.clientY > rect.bottom) onClose();
      }}
    >
      <header className="meeting-header">
        <div>
          <h2 id="meeting-title"><Icon name="calendar" />{s.title}</h2>
          <p>{s.description}</p>
        </div>
        <button ref={closeRef} type="button" className="modal-close" onClick={onClose} aria-label={s.close}>
          <Icon name="close" />
        </button>
      </header>
      <div className="meeting-toolbar">
        <span>{s.note}</span>
        <a href={MEETING_URL} target="_blank" rel="noopener noreferrer">{s.openExternal}<Icon name="arrow" /></a>
      </div>
      <div className="meeting-embed">
        {!loaded && <p className="meeting-loading" role="status">{slow ? s.slow : s.loading}</p>}
        <iframe src={embedUrl.href} title={s.frameTitle} onLoad={() => setLoaded(true)} onError={() => setSlow(true)} />
      </div>
    </dialog>
  );
}
