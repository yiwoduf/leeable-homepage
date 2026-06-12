import type { Lang } from './types';
import type { SectionId } from '../config/navigation';

/** All UI strings keyed by area. Both languages must satisfy this interface. */
export interface UiStrings {
  /** Accessible label for the <nav> landmark. */
  navAria: string;
  /** Section navigation labels (keyed by section id). */
  nav: Record<SectionId, string>;

  /** Kickers, titles, and leads for each section. */
  sections: {
    hero: { screenLabel: string };
    about: { kicker: string; title: string; screenLabel: string };
    experience: { kicker: string; title: string; screenLabel: string };
    solutions: {
      kicker: string;
      title: string;
      lead: string;
      screenLabel: string;
    };
    projects: {
      kicker: string;
      title: string;
      soon: string;
      screenLabel: string;
    };
    skills: {
      kicker: string;
      title: string;
      lead: string;
      screenLabel: string;
    };
    contact: {
      kicker: string;
      bigLine1: string;
      kwWord: string;
      lead: string;
      screenLabel: string;
    };
  };

  /** Hero section CTAs and labels. */
  hero: {
    resume: string;
    getInTouch: string;
  };

  /** SolutionCard labels. */
  solutionCard: {
    live: string;
    inProgress: string;
    problem: string;
    role: string;
    system: string;
    outcome: string;
  };

  /** Email copy button. */
  email: {
    copyAria: string;
    copied: string;
    copy: string;
  };

  /** Social rail labels / tooltips. */
  social: {
    github: string;
    linkedin: string;
    x: string;
    email: string;
    resumePdf: string;
    resume: string;
  };

  /** TopBar controls. */
  topbar: {
    settingsAria: string;
  };

  /** Settings modal. */
  settings: {
    title: string;
    theme: string;
    themeDark: string;
    themeLight: string;
    language: string;
    close: string;
  };

  /** Footer. */
  footer: {
    builtInPublic: string;
  };
}

/** All hardcoded UI strings for both languages. */
export const UI_STRINGS: Record<Lang, UiStrings> = {
  en: {
    navAria: 'Sections',
    nav: {
      hero: 'Index',
      about: 'About',
      experience: 'Experience',
      solutions: 'Solutions',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
    },
    sections: {
      hero: { screenLabel: 'Hero' },
      about: {
        kicker: 'About',
        title: 'Software roots.\nNow shipping *autonomy*.',
        screenLabel: 'About',
      },
      experience: {
        kicker: 'Experience',
        title: "Where I've *built*.",
        screenLabel: 'Experience',
      },
      solutions: {
        kicker: 'AI Solutions',
        title: 'Agents doing real *work*.',
        lead: "Autonomous systems I've designed and shipped to solve real-life problems — open a card to see the workflow and architecture.",
        screenLabel: 'AI Solutions',
      },
      projects: {
        kicker: 'Projects',
        title: "Things I've *made*.",
        soon: 'soon',
        screenLabel: 'Projects',
      },
      skills: {
        kicker: 'Skills / Stack',
        title: 'The *toolkit*.',
        lead: 'The languages, frameworks, and AI tooling I reach for — grouped by where they live in the stack.',
        screenLabel: 'Skills',
      },
      contact: {
        kicker: 'Contact',
        bigLine1: "Let's build",
        kwWord: 'something',
        lead: 'Open to full-time AI Product Engineer / Applied AI Engineer roles — and to AI-solution consulting, helping teams bring AI into how they actually work. The fastest way to reach me:',
        screenLabel: 'Contact',
      },
    },
    hero: {
      resume: 'Résumé',
      getInTouch: 'Get in touch',
    },
    solutionCard: {
      live: 'Live',
      inProgress: 'In progress',
      problem: 'The problem',
      role: 'My role',
      system: 'System / workflow',
      outcome: 'Outcome',
    },
    email: {
      copyAria: 'Copy email address',
      copied: 'Copied',
      copy: 'Copy',
    },
    social: {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      x: 'X',
      email: 'Email',
      resumePdf: 'Résumé (PDF)',
      resume: 'Résumé',
    },
    topbar: {
      settingsAria: 'Open settings',
    },
    settings: {
      title: 'Settings',
      theme: 'Theme',
      themeDark: 'Dark',
      themeLight: 'Light',
      language: 'Language',
      close: 'Close',
    },
    footer: {
      builtInPublic: 'Built in public · leeable.dev',
    },
  },

  ko: {
    navAria: '섹션',
    nav: {
      hero: '홈',
      about: '소개',
      experience: '경력',
      solutions: '솔루션',
      projects: '프로젝트',
      skills: '기술',
      contact: '연락처',
    },
    sections: {
      hero: { screenLabel: '홈' },
      about: {
        kicker: '소개',
        title: '코드를 짜던 손으로\n*자율*을 설계합니다.',
        screenLabel: '소개',
      },
      experience: {
        kicker: '경력',
        title: '실무로 그려가는 *방향*',
        screenLabel: '경력',
      },
      solutions: {
        kicker: 'AI 솔루션',
        title: '함께 일하는 AI *솔루션*',
        lead: '실제 문제를 풀기 위해 직접 설계하고 운영 중인 자율 시스템들입니다. 카드를 열면 워크플로우와 아키텍처를 확인할 수 있습니다.',
        screenLabel: 'AI 솔루션',
      },
      projects: {
        kicker: '프로젝트',
        title: '아이디어에서 *제품*까지',
        soon: '준비 중',
        screenLabel: '프로젝트',
      },
      skills: {
        kicker: '기술 스택',
        title: '솔루션을 위한 *기술* 스택',
        lead: '스택 전반에 걸쳐 실제로 쓰는 언어, 프레임워크, AI 도구들을 모았습니다.',
        screenLabel: '기술',
      },
      contact: {
        kicker: '연락처',
        bigLine1: '다음 솔루션의',
        kwWord: '시작',
        lead: 'AI Product Engineer / Applied AI Engineer 풀타임 포지션을 찾고 있습니다 — 팀의 실제 업무 흐름에 AI를 도입하는 AI 솔루션 컨설팅 의뢰도 환영합니다. 가장 빠른 연락 방법:',
        screenLabel: '연락처',
      },
    },
    hero: {
      resume: '이력서',
      getInTouch: '연락하기',
    },
    solutionCard: {
      live: '운영 중',
      inProgress: '개발 중',
      problem: '문제 상황',
      role: '담당 역할',
      system: '시스템 / 워크플로우',
      outcome: '결과',
    },
    email: {
      copyAria: '이메일 주소 복사',
      copied: '복사됨',
      copy: '복사',
    },
    social: {
      github: 'GitHub',
      linkedin: 'LinkedIn',
      x: 'X',
      email: '이메일',
      resumePdf: '이력서 (PDF)',
      resume: '이력서',
    },
    topbar: {
      settingsAria: '설정 열기',
    },
    settings: {
      title: '설정',
      theme: '테마',
      themeDark: '다크',
      themeLight: '라이트',
      language: '언어',
      close: '닫기',
    },
    footer: {
      builtInPublic: '공개 개발 중 · leeable.dev',
    },
  },
};
