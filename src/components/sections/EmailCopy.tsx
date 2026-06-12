import { useState } from 'react';
import type { MouseEvent } from 'react';
import { Icon } from '../ui/Icon';
import { cx } from '../../lib/cx';
import { glowHandlers } from '../../lib/cardGlow';
import { useI18n } from '../../i18n';

/** Email address with a one-click copy button + transient "Copied" state. */
export function EmailCopy({ email }: { email: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  const copy = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1900);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(email).then(done).catch(done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* copy unsupported — leave selection for manual copy */
      }
      document.body.removeChild(ta);
      done();
    }
  };

  return (
    <div className="contact-mail-wrap glow" {...glowHandlers}>
      <div className="cb-bar" aria-hidden="true">
        <span className="cb-dot" />
        <span className="cb-dot" />
        <span className="cb-dot" />
        <span className="cb-name">contact.sh</span>
      </div>
      <div className="cb-body">
        <a className="email-plain" href={`mailto:${email}`}>
          <span>{email}</span>
        </a>
        <button className={cx('copy-btn', copied && 'copied')} onClick={copy} aria-label={t.email.copyAria}>
          <Icon name={copied ? 'check' : 'copy'} />
          <span className="copy-tip">{copied ? t.email.copied : t.email.copy}</span>
        </button>
      </div>
    </div>
  );
}
