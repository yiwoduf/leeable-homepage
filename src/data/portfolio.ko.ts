import type { PortfolioData } from '../types/portfolio';

/**
 * Korean portfolio content — mirrors portfolio.ts structure exactly.
 * Identity fields (name, links, urls, skills arrays) stay identical to EN.
 * Company / product / proper nouns stay in English per Korean dev convention.
 */
export const portfolioKo: PortfolioData = {
  identity: {
    name: 'Jaeyol Lee',
    nickname: 'Peter',
    role: 'AI 프로덕트 엔지니어',
    tagline: '실제 워크플로우를 끝까지 자동화하는 **멀티 에이전트 AI 시스템**을 만듭니다.',
    location: 'Dallas–Fort Worth, TX',
    resume: 'Jaeyol-Lee-Resume.pdf',
    email: 'yiwoduf@gmail.com',
    github: 'https://github.com/yiwoduf',
    githubLabel: 'github.com/yiwoduf',
    linkedin: 'https://linkedin.com/in/yiwoduf',
    linkedinLabel: 'linkedin.com/in/yiwoduf',
    instagram: 'https://instagram.com/o2.27.o2',
    x: 'https://x.com/yiwoduf',
  },

  about: {
    lead: '상장 HR/급여 SaaS 기업에서 약 2년간 프로덕션 소프트웨어를 직접 출시했습니다. 지금은 AI 프로덕트를 처음부터 끝까지 혼자 설계하고 구현합니다.',
    body: '실제 업무를 자동화하는 멀티 에이전트 시스템을 만듭니다. 에이전트가 레버리지를 가장 크게 낼 수 있는 지점을 찾아내고, 사람 손 없이 돌아가는 자율 파이프라인을 끝까지 완성합니다. 12살부터 독학으로 시스템을 쌓아 온, 만드는 것 자체가 목표인 엔지니어입니다.',
    facts: [
      { k: '거주지', v: 'Dallas–Fort Worth, TX' },
      { k: '언어', v: '영어, 한국어' },
      { k: '학력', v: 'B.S. Computer Science, University of Kansas' },
      { k: '집중 분야', v: '멀티 에이전트 시스템 · 워크플로우 자동화' },
    ],
    stats: [
      { n: '5+', l: '운영 에이전트' },
      { n: '2,259+', l: '누적 처리 작업' },
      { n: '약 2년', l: '프로덕션 경력' },
      { n: '매일', l: '무인 자동 실행' },
    ],
  },

  experience: [
    {
      role: 'Independent AI Product Engineer',
      sub: 'Building in Public',
      org: 'Remote',
      period: '2026년 4월 — 현재',
      now: true,
      points: [
        'Pi/OpenClaw 런타임 위에 프로덕션 멀티 에이전트 AI 시스템을 직접 설계하고 구축했습니다. 오케스트레이터 → 전문 에이전트 계층 구조, 플러그인 기반 하네스(PreToolUse/PostToolUse 훅), MCP 통합(Notion, Google Workspace)을 모두 포함합니다.',
        '채용 공고를 매일 크롤링·스코어링·라우팅하는 완전 자율 파이프라인을 구축했습니다. 지금까지 2,259건 이상을 사람 개입 없이 처리했습니다.',
      ],
      tags: ['Multi-agent', 'OpenClaw', 'n8n', 'MCP', 'Supabase'],
    },
    {
      role: 'Software Developer II → III',
      sub: '',
      org: 'Paycom · Irving, TX',
      period: '2024년 11월 — 2026년 5월',
      points: [
        'Software Developer III로 조기 승진, 팀 내 최연소로 성과 보너스 수령. 테스트 실행 20건 이상, 개발 티켓 200건 이상에서 Lead Dev / Lead Tester 역할을 맡았습니다.',
        '후보자 데이터로부터 관할권을 자동 선택하는 시스템을 엔드투엔드로 설계·출시했습니다. DB 스키마, 서드파티 API 통합, 14개 스토리에 걸친 신규 데이터 모델을 단독 담당했습니다.',
        '3주 데드라인 안에 복잡한 자격 심사 흐름을 처리하는 Progressive Disclosure UX를 설계해 멀티 모듈 컴플라이언스 기능을 혼자 엔드투엔드로 완성했습니다.',
        '보안 제한 환경에서 AI 보조 개발을 가능하게 하는 내부 하네스를 구축하고, 팀 전체의 AI 코딩 워크플로우를 표준화했습니다.',
      ],
      tags: ['PHP', 'React', 'MySQL', 'System design'],
    },
    {
      role: 'Research Assistant — Web Developer',
      sub: '',
      org: 'University of Kansas · Lawrence, KS',
      period: '2023년 1월 — 2024년 8월',
      points: [
        'UI/UX 디자인 교수와 협업해 당뇨 관리 헬스케어 웹앱 MVP를 빠르게 만들고 반복 개선 — 실제 환자 설문 피드백을 디자인 사고 기반으로 사용자 중심 인터페이스에 녹였습니다 (Next.js, React, Vercel).',
      ],
      tags: ['Next.js', 'React', 'Vercel'],
    },
    {
      role: 'IT Student Technician — Team Lead',
      sub: '',
      org: 'University of Kansas · Lawrence, KS',
      period: '2022년 7월 — 2024년 7월',
      points: [
        '학생 기술자 팀을 이끌며 캠퍼스 IT 운영, 하드웨어 프로비저닝, 사용자 지원 전반을 담당했습니다.',
      ],
      tags: ['Team lead', 'Support'],
    },
  ],

  solutions: [
    {
      title: 'Autonomous Job-Search Pipeline',
      codename: 'Career HQ',
      status: 'live',
      blurb: '매일 아침 구직 공고를 수집·평가·분류해 최적의 기회를 정렬해 주는 완전 자율 파이프라인.',
      problem: '이직 준비 중 수작업 구직은 느리고 기회를 놓치기 쉬웠습니다. 공고 검색부터 지원서 맞춤화까지 일일이 처리하는 방식으로는 속도가 나지 않았습니다.',
      role: '시스템 설계 · 에이전트 오케스트레이션 · TypeScript 플러그인 · 하네스 엔지니어링',
      flow: [
        { k: 'Apify', d: '공고 크롤링' },
        { k: 'n8n', d: '오전 7시 크론 트리거' },
        { k: 'Supabase', d: '저장 + 중복 제거' },
        { k: 'LLM scoring', d: '적합도 순위 평가' },
        { k: 'Notion', d: '파이프라인 보드' },
        { k: 'position-analyst', d: '심층 적합도 분석' },
        { k: 'Discord', d: '알림 + 요약 전송' },
      ],
      metrics: [
        { n: '2,259+', l: '스코어링된 공고' },
        { n: '매일', l: '무인 자동 실행' },
        { n: '자동', l: '이력서 · 커버레터 맞춤화' },
      ],
    },
    {
      title: 'AI News Briefing Agent',
      codename: 'Wire',
      status: 'in-progress',
      blurb: 'AI 뉴스를 수집·중복 제거·요약해 매일 하나의 브리핑으로 자동 전달하는 스케줄 에이전트.',
      problem: 'AI 분야는 속도가 너무 빨라 수작업으로는 따라가기 어렵습니다. 직접 만든 에이전트가 매일 신뢰할 수 있는 브리핑을 알아서 구성하도록 설계했습니다.',
      role: '현재 개발 중 — 아키텍처 설계와 소스 선별 진행 중.',
      flow: [
        { k: 'Sources', d: 'RSS + API' },
        { k: 'Agent', d: '클러스터링 + 랭킹' },
        { k: 'Summary', d: '브리핑 생성' },
        { k: 'Delivery', d: '일일 배포' },
      ],
      metrics: [],
    },
  ],

  projects: [
    {
      name: 'notion-quest-board',
      desc: 'Notion 데이터베이스를 게임형 퀘스트 보드로 감싼 할 일 관리 웹앱. 할 일은 퀘스트가 되고 상태는 Notion API로 실시간 동기화됩니다.',
      stack: ['Next.js', 'TypeScript', 'Notion API'],
      link: null,
    },
    {
      name: 'OpenClaw Harness Plugin',
      desc: 'OpenClaw 런타임용 TypeScript 하네스/웹훅 플러그인. PreToolUse/PostToolUse 훅으로 에이전트의 툴 호출을 안전하고 추적 가능하게 유지합니다.',
      stack: ['TypeScript', 'OpenClaw', 'Webhooks'],
      link: null,
    },
    {
      name: 'Argon MS — Online Game Server',
      desc: '10대 시절 밑바닥부터 직접 만들고 운영한 온라인 게임 서버. Java 서버 백엔드, MySQL/MariaDB 데이터베이스, JavaScript NPC 스크립팅, 클라이언트 리버스 엔지니어링까지 — 서버 운영, 콘텐츠, 라이브 디버깅을 전부 혼자 담당했습니다.',
      stack: ['Java', 'MySQL', 'JavaScript', 'Reverse Engineering'],
      link: 'https://github.com/yiwoduf/Argon-MS',
    },
    {
      name: 'leeable.dev — Portfolio',
      desc: '지금 보고 계신 이 사이트. EN/KO 다국어, AI 비서 챗봇, 다크 모드, 프롬프트 인젝션에 강한 시스템 프롬프트까지 — React, TypeScript, Vite로 만들었습니다.',
      stack: ['React', 'TypeScript', 'i18n', 'AI Chatbot'],
      link: 'https://github.com/yiwoduf/leeable-homepage',
    },
  ],

  // Skills arrays are identical to EN — tech terms stay in English.
  skills: [
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'PHP'] },
    { group: 'Frontend', items: ['React', 'Next.js'] },
    { group: 'Backend & Data', items: ['Node.js', 'PostgreSQL', 'MySQL', 'Supabase', 'NoSQL', 'Vector DB'] },
    { group: 'AI & Agents', items: ['Claude', 'MCP', 'RAG', 'CAG', 'n8n', 'OpenClaw', 'Codex'] },
    { group: 'Infra & Tools', items: ['Docker', 'Git', 'Vercel', 'Google Cloud'] },
  ],
};
