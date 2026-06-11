import type { Identity } from '../../types/portfolio';
import { Section, Kicker, SectionLead, Button, Icon } from '../ui';
import { cssVars } from '../../lib/cssVars';
import { EmailCopy } from './EmailCopy';

export function ContactSection({ identity }: { identity: Identity }) {
  const year = new Date().getFullYear();
  return (
    <Section id="contact" alt className="contact" innerClassName="contact-inner" label="Contact">
      <Kicker idx="06" center>
        Contact
      </Kicker>
      <h2 className="contact-big reveal" style={cssVars({ '--d': '.06s' })}>
        Let's build
        <br />
        <span className="kw">
          <span className="kw-word">something</span>
          <span className="kw-dot">.</span>
        </span>
      </h2>
      <SectionLead style={{ margin: '20px auto 0', textAlign: 'center' }}>
        Open for personal inquiries and AI-solution consulting — I help teams introduce new AI systems into
        their everyday tasks and workflows. The fastest way to reach me:
      </SectionLead>
      <div className="reveal" style={{ display: 'flex', justifyContent: 'center', ...cssVars({ '--d': '.2s' }) }}>
        <EmailCopy email={identity.email} />
      </div>
      <div className="contact-links reveal" style={cssVars({ '--d': '.27s' })}>
        <Button href={identity.github} target="_blank" rel="noopener">
          <Icon name="github" /> GitHub
        </Button>
        <Button href={identity.linkedin} target="_blank" rel="noopener">
          <Icon name="linkedin" /> LinkedIn
        </Button>
        <Button variant="primary" href={identity.resume} target="_blank" rel="noopener">
          <Icon name="download" /> Résumé
        </Button>
      </div>
      <div className="footer reveal" style={cssVars({ '--d': '.33s' })}>
        <span>
          © {year} {identity.name} — {identity.role}
        </span>
        <span>Built in public · leeable.dev</span>
      </div>
    </Section>
  );
}
