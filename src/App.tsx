import { portfolio } from './data/portfolio';
import { siteConfig, motionFactor } from './config/site';
import { useTheme } from './hooks/useTheme';
import { useReveal } from './hooks/useReveal';
import { useScrollSpy } from './hooks/useScrollSpy';
import { useSectionSnap } from './hooks/useSectionSnap';
import { useHideOnScroll } from './hooks/useHideOnScroll';
import { useResizeRealign } from './hooks/useResizeRealign';
import { useContentRealign } from './hooks/useContentRealign';
import { BackgroundField, TopBar, SideNav, SocialRail, MobileNav, ScrollHint } from './components/layout';
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
 * stacked content sections. Design knobs come from `siteConfig`; only dark/light
 * is interactive (persisted by `useTheme`).
 */
export function App() {
  const { isDark, toggle } = useTheme();
  const { active, progress } = useScrollSpy();
  const headerHidden = useHideOnScroll();
  useReveal();
  useSectionSnap();
  useResizeRealign(active);
  useContentRealign(active);

  const { identity } = portfolio;

  return (
    <div className="app">
      <BackgroundField variant={siteConfig.background} />
      <TopBar isDark={isDark} onToggleTheme={toggle} hidden={headerHidden} />
      <SideNav active={active} progress={progress} navStyle={siteConfig.nav} boxed={siteConfig.navBoxed} />
      <MobileNav active={active} />
      <SocialRail identity={identity} />
      <ScrollHint />

      <main>
        <HeroSection
          identity={identity}
          layout={siteConfig.heroLayout}
          hero3d={siteConfig.hero3d}
          accent={siteConfig.accent}
          motion={motionFactor}
          dark={isDark}
        />
        <AboutSection about={portfolio.about} />
        <ExperienceSection experience={portfolio.experience} />
        <SolutionsSection solutions={portfolio.solutions} />
        <ProjectsSection projects={portfolio.projects} />
        <SkillsSection skills={portfolio.skills} />
        <ContactSection identity={identity} />
      </main>
    </div>
  );
}
