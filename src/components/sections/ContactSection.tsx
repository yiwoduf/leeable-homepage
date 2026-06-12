import type { Identity } from '../../types/portfolio';
import { Section, Kicker, SectionLead, Button, Icon } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { EmailCopy } from './EmailCopy';
import { useI18n } from '../../i18n';

/** Public repo of this site — the footer "Fork me" link target. */
const SITE_REPO_URL = 'https://github.com/yiwoduf/leeable-homepage';

export function ContactSection({ identity }: { identity: Identity }) {
  const { t } = useI18n();
  const s = t.sections.contact;
  const year = new Date().getFullYear();

  return (
    <Section id="contact" alt className="contact" innerClassName="contact-inner" label={s.screenLabel}>
      <Kicker idx="06" center>
        {s.kicker}
      </Kicker>
      <h2 className="contact-big reveal" style={cssVars({ '--d': '.06s' })}>
        {s.bigLine1}
        <br />
        <span className="kw">
          <span className="kw-word">{s.kwWord}</span>
          <span className="kw-dot">.</span>
        </span>
      </h2>
      <SectionLead style={{ margin: '20px auto 0', textAlign: 'center' }}>
        {s.lead}
      </SectionLead>
      <div className="reveal" style={{ display: 'flex', justifyContent: 'center', ...cssVars({ '--d': '.2s' }) }}>
        <EmailCopy email={identity.email} />
      </div>
      <div className="contact-links reveal" style={cssVars({ '--d': '.27s' })}>
        <Button href={identity.github} target="_blank" rel="noopener">
          <Icon name="github" /> {t.social.github}
        </Button>
        <Button href={identity.linkedin} target="_blank" rel="noopener">
          <Icon name="linkedin" /> {t.social.linkedin}
        </Button>
        <Button href={identity.x} target="_blank" rel="noopener">
          <Icon name="x" /> {t.social.x}
        </Button>
        <Button variant="primary" href={identity.resume} target="_blank" rel="noopener">
          <Icon name="download" /> {t.social.resume}
        </Button>
      </div>
      <div className="footer reveal" style={cssVars({ '--d': '.33s' })}>
        <span>
          © {year} {identity.name} — {identity.role}
        </span>
        <span className="footer-repo">
          {t.footer.builtInPublic}
          <a
            className="repo-link"
            href={SITE_REPO_URL}
            target="_blank"
            rel="noopener"
            aria-label="View source on GitHub"
          >
            <Icon name="github" />
          </a>
        </span>
      </div>
    </Section>
  );
}
