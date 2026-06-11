import type { IconName } from '../components/ui/Icon';

/** Section ids, in document order. Used by the nav, scroll-spy, and snap. */
export type SectionId =
  | 'hero'
  | 'about'
  | 'experience'
  | 'solutions'
  | 'projects'
  | 'skills'
  | 'contact';

export interface NavItem {
  id: SectionId;
  icon: IconName;
}

export const NAV: readonly NavItem[] = [
  { id: 'hero', icon: 'home' },
  { id: 'about', icon: 'user' },
  { id: 'experience', icon: 'briefcase' },
  { id: 'solutions', icon: 'cpu' },
  { id: 'projects', icon: 'folder' },
  { id: 'skills', icon: 'layers' },
  { id: 'contact', icon: 'mail' },
];
