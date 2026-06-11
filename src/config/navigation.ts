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
  label: string;
  icon: IconName;
}

export const NAV: readonly NavItem[] = [
  { id: 'hero', label: 'Index', icon: 'home' },
  { id: 'about', label: 'About', icon: 'user' },
  { id: 'experience', label: 'Experience', icon: 'briefcase' },
  { id: 'solutions', label: 'Solutions', icon: 'cpu' },
  { id: 'projects', label: 'Projects', icon: 'folder' },
  { id: 'skills', label: 'Skills', icon: 'layers' },
  { id: 'contact', label: 'Contact', icon: 'mail' },
];
