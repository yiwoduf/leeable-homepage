import { useCallback, useState } from 'react';
import { siteConfig, motionFactor } from './config/site';
import { useTheme } from './hooks/useTheme';
import { useReveal } from './hooks/useReveal';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useSectionSnap } from './hooks/useSectionSnap';
import { useHideOnScroll } from './hooks/useHideOnScroll';
import { useResizeRealign } from './hooks/useResizeRealign';
import { useContentRealign } from './hooks/useContentRealign';
import { useI18n } from './i18n';
import { MeetingModal } from './components/layout/MeetingModal';
import { ChatWidget } from './components/chat';
import { BackgroundField, TopBar, SideNav, SocialRail, MobileNav, ScrollHint, SettingsModal } from './components/layout';
import {
  HeroSection,
  AboutSection,
  ExperienceSection,
  SolutionsSection,
  ProjectsSection,
  SkillsSection,
  ContactSection,
} from './components/sections';

/**
 * App shell — fixed chrome (background, top bar, side nav, social rail) plus the
 * stacked content sections. Design knobs come from `siteConfig`; theme and
 * language are interactive via the settings modal (persisted by `useTheme` /
 * `LanguageProvider`).
 */
export function App() {
  const { isDark, preference, setPreference } = useTheme();
  const { active } = useScrollSpy();
  const headerHidden = useHideOnScroll();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const openMeeting = useCallback(() => setMeetingOpen(true), []);
  const { lang, content } = useI18n();
  useReveal();
  useSectionSnap();
  useResizeRealign(active);
  useContentRealign(active);

  const { identity } = content;

  return (
    <div className="app">
      <BackgroundField variant={siteConfig.background} />
      <TopBar hidden={headerHidden} onOpenSettings={() => setSettingsOpen(true)} />
      <SideNav active={active} navStyle={siteConfig.nav} boxed={siteConfig.navBoxed} />
      <MobileNav active={active} />
      <SocialRail identity={identity} />
      <ScrollHint />
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        preference={preference}
        onSetPreference={setPreference}
      />

      <main>
        <HeroSection
          identity={identity}
          layout={siteConfig.heroLayout}
          hero3d={siteConfig.hero3d}
          accent={siteConfig.accent}
          motion={motionFactor}
          dark={isDark}
        />
        <AboutSection about={content.about} />
        <ExperienceSection experience={content.experience} />
        <SolutionsSection solutions={content.solutions} />
        <ProjectsSection projects={content.projects} />
        <SkillsSection skills={content.skills} />
        <ContactSection identity={identity} onOpenMeeting={openMeeting} />
      </main>

      <ChatWidget lang={lang} onOpenMeeting={openMeeting} />
      {meetingOpen && <MeetingModal onClose={() => setMeetingOpen(false)} />}
    </div>
  );
}
