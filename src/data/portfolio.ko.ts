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
    x: 'https://x.com/yiwoduf',
  },

  about: {
    lead: '고객의 일상 업무를 실제로 쓰이는 AI·웹 제품으로 바꾸는 AI 프로덕트 엔지니어.',
    body: '고객과 직접 대화해 매일의 업무 흐름을 파악하고, 반복되거나 마찰이 큰 지점을 찾아 AI 제품·워크플로우 자동화·풀스택 웹 제품으로 설계하고 구축합니다. 또한 사람 손 없이 운영되는 멀티 에이전트 시스템과 자율 파이프라인을 설계하고 운영합니다. 12살부터 독학으로 시스템을 쌓아 온, 만드는 것 자체가 목표인 엔지니어입니다.',
    facts: [
      { k: '거주지', v: 'Dallas–Fort Worth, TX' },
      { k: '언어', v: '영어 · 한국어' },
      { k: '학력', v: 'B.S. Computer Science, University of Kansas' },
      { k: '집중 분야', v: '멀티 에이전트 시스템 · 워크플로우 자동화' },
    ],
    stats: [
      { n: '15+', l: '운영 에이전트' },
      { n: '500+/일', l: '처리·인덱싱 데이터' },
      { n: '약 2년', l: '프로덕션 경력' },
      { n: '24/7', l: '자율 운영' },
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
        '고객과 직접 소통하며 매일의 업무 흐름을 파악하고, 반복되거나 마찰이 큰 단계를 찾아 AI 제품·워크플로우 자동화·웹 제품으로 구현합니다. 문제 발견부터 솔루션 설계, 풀스택 개발, 반복 개선까지 전 과정을 책임집니다.',
        'Pi/OpenClaw 위에 15개 이상의 에이전트를 위한 재사용 가능한 멀티 에이전트 플랫폼을 구축했습니다. 계층형 오케스트레이션, MCP 통합, 훅 기반 가드레일, 최소 권한 툴 접근을 갖춰 핵심 오케스트레이션이나 안전 제어를 다시 만들지 않고도 새 워크플로우를 추가할 수 있습니다.',
        'n8n, Supabase/PostgreSQL, 벡터 검색을 활용해 매일 500건 이상의 데이터를 수집·분석·임베딩·인덱싱하는 이벤트 기반 자율 RAG 파이프라인을 구축하고 운영합니다. 추적 가능한 출처를 바탕으로 추천과 리포트를 생성하며 일상적인 수작업이 필요 없습니다.',
        '프롬프트·하네스 설계, 모델 티어링, 워크로드 분할을 통해 분석 품질은 유지하면서 LLM API 비용을 약 50% 절감했습니다.',
      ],
      tags: ['Multi-agent', 'OpenClaw', 'n8n', 'MCP', 'Supabase', 'RAG'],
    },
    {
      role: 'Software Developer II → III',
      sub: '',
      org: 'Paycom · Irving, TX',
      period: '2024년 11월 — 2026년 5월',
      points: [
        '팀 내 최연소 멤버로서 동료들보다 앞서 Software Developer III로 승진했고, 꾸준히 임팩트 있는 결과물을 내며 성과 보너스를 받았습니다. 테스트 실행 20건 이상, 개발 티켓 200건 이상에서 Lead Dev / Lead Tester를 맡았습니다.',
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
      solution: '여러 에이전트가 협업해 가장 적합한 공고만 매일 정리해 주는 자율 파이프라인 — 몇 시간의 수동 검색을 몇 분의 검토로 줄였습니다.',
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
        { n: '매일', l: '공고 평가·분류' },
        { n: '0', l: '일상적 수작업' },
        { n: '자동', l: '이력서 · 커버레터 맞춤화' },
      ],
    },
    {
      title: 'Autonomous News Intelligence',
      codename: 'News HQ',
      status: 'live',
      blurb: '뉴스를 매일 아침 자동으로 수집·중복 제거·분석·보고하고, 그 내용을 RAG로 답변까지 하는 자체 호스팅 멀티 에이전트 뉴스룸입니다.',
      problem: 'AI·기술·시장 뉴스를 손으로 따라가는 건 느리고 빠짐이 많습니다. 중요한 소식이 수십 개 피드에 흩어져 사라지죠. 목표는 사람 손을 거치지 않고도 알아서 구성·저장·질의까지 되는 신뢰할 수 있는 일일 브리핑입니다.',
      solution: '큐레이터·애널리스트·리포터·RAG 챗 — 네 개의 에이전트가 협업하는 자체 호스팅 뉴스룸이 매일 무인으로 돕니다. 10개 이상의 신뢰할 수 있는 소스에서 약 500건의 기사를 가져와 의미 기반으로 중복을 제거하고, 심층 분석을 작성한 뒤 pgvector 지식베이스와 Notion에 저장하고, 카테고리별 브리핑을 Discord와 iMessage로 전달합니다. 챗 에이전트는 같은 벡터 저장소를 근거로 질문에 답합니다.',
      role: '시스템 설계 · 멀티 에이전트 오케스트레이션 · 레이스 컨디션 없는 병렬 실행 · 하네스+프롬프트 엔지니어링(품질 유지하며 API 비용 절감) · 자가 복구',
      flow: [
        { k: 'RSS ×10+',    d: '신뢰 소스' },
        { k: 'n8n',         d: 'Fetch + 임베딩 (cron)' },
        { k: 'Supabase',    d: '저장 + pgvector' },
        { k: 'Curator',     d: '분류 + 중복 제거' },
        { k: 'Analysts ×3', d: '병렬 심층 분석' },
        { k: 'Reporter',    d: 'Notion · Discord · iMessage' },
        { k: 'RAG chat',    d: '벡터 검색 Q&A' },
      ],
      metrics: [
        { n: '500+/일', l: '처리·인덱싱 기사' },
        { n: '2×',      l: '병렬 실행으로 단축' },
        { n: '10+',      l: '소스 · 9개 카테고리' },
        { n: 'Auto',     l: '자가 복구' },
      ],
    },
    {
      title: 'Self-Tuning Meta Agent',
      codename: 'Closed Loop',
      status: 'in-progress',
      blurb: '에이전트 시스템 위에 올라가, 스스로의 동작을 측정하고 실시간 지표와 사람 피드백을 바탕으로 자신의 파라미터와 프롬프트를 조정하는 메타 레이어입니다.',
      problem: '파이프라인은 무인으로 돌지만, 품질이 흔들리거나 유입이 급증할 때마다 임계값·큐레이션 기준·프롬프트를 사람이 손으로 조정해야 합니다. 목표는 그 루프를 닫는 것입니다 — 시스템이 자기 동작을 관찰하고 사람 없이도 작고 안전한 범위의 조정을 스스로 하도록 만드는 것이죠.',
      solution: '세 가지 구체적인 메커니즘을 가진 메타 레이어를 계획하고 있습니다. (1) 자가 관찰 — 매일의 신호(유입량, 분석 완료율, 데드라인 준수, 중복 제거 정확도, RAG 검색 유사도 분포)를 로깅하고 임계값을 넘으면 자동으로 대응합니다(예: 유입 폭주 시 circuit breaker 자동 발동). (2) 품질 피드백 루프 — 리포트·챗 답변에 대한 좋아요/싫어요 평가가 큐레이터의 Fit 기준과 프롬프트에 반영돼 시간이 지날수록 큐레이션이 정교해집니다. (3) 메타 에이전트 — 주기적으로 다른 에이전트들의 로그와 실패를 읽어 어느 프롬프트가 자꾸 새는지 진단하고 수정안을 제안합니다. 가드레일 안에서의 자가 튜닝이지, 자기 코드를 다시 쓰는 것이 아닙니다.',
      role: '측정 레이어와 가드레일을 설계하는 단계입니다 — 손으로 하던 튜닝을 규칙화된, 범위가 정해진 자가 조정으로 바꾸는 작업이며, 이미 운영 중인 News HQ 파이프라인이 내보내는 신호 위에 얹습니다.',
      flow: [
        { k: 'Observe',    d: '시스템 지표 로깅' },
        { k: 'Detect',     d: '임계값 체크' },
        { k: 'Adjust',     d: '범위 내 자가 튜닝' },
        { k: 'Feedback',   d: '평점이 Fit 조정' },
        { k: 'Meta-agent', d: '진단 + 제안' },
      ],
      metrics: [],
    },
  ],

  projects: [
    {
      name: 'notion-quest-board',
      desc: 'Notion 데이터베이스를 게임형 퀘스트 보드로 감싼 할 일 관리 웹앱. 할 일은 퀘스트가 되고 상태는 Notion API로 실시간 동기화됩니다.',
      stack: ['Next.js', 'TypeScript', 'Notion API'],
      link: 'https://todo.leeable.dev/',
      live: true,
    },
    {
      name: 'OpenClaw Hook Harness Plugin',
      desc: 'OpenClaw 런타임용 TypeScript 하네스 플러그인. PreToolUse/PostToolUse 훅으로 에이전트의 툴 호출을 안전하고 추적 가능하게 유지합니다.',
      stack: ['TypeScript', 'OpenClaw', 'Hooks'],
      link: 'https://github.com/yiwoduf/openclaw-hook-harness',
    },
    {
      name: 'OpenClaw Webhook Trigger Harness Plugin',
      desc: '네이티브 웹 페치를 하네스를 씌운 툴 호출형 웹훅 트리거로 대체합니다. 허용된 에이전트가 허용된 URL만 호출할 수 있어, 프롬프트 인젝션이나 모델의 판단 미스로도 외부 웹을 가져올 수 없습니다.',
      stack: ['TypeScript', 'OpenClaw', 'AI Security'],
      link: 'https://github.com/yiwoduf/openclaw-webhook-trigger',
    },
    {
      name: 'OpenClaw News RAG Plugin',
      desc: 'News HQ 벡터 저장소를 대화형 에이전트가 의미 기반으로 검색할 수 있게 해주는 OpenClaw 툴 플러그인입니다 — retrieval-as-a-tool 패턴. 질문을 임베딩(OpenAI 1536차원)한 뒤 벡터 코사인 검색(선택적 최신성 필터)을 수행하고, 출처가 명확한 근거를 유사도 순으로 반환합니다. SQL과 원시 벡터는 도구 안에 봉인돼 에이전트가 직접 만지지 않습니다.',
      stack: ['TypeScript', 'OpenClaw', 'Vector DB', 'RAG'],
      link: null,
    },
    {
      name: 'Workflow Diagram Generator',
      desc: 'Figma처럼 손으로 끌어 그리는 대신 AI가 작성하는 아키텍처·워크플로우 다이어그램 도구입니다. 흐름을 말로 설명하면 AI가 선언형 스펙을 작성하고, 내장 디자인 시스템으로 렌더링해 픽셀 단위로 깔끔한 PNG나 반복 GIF로 내보냅니다. 클론한 뒤 Claude Code를 열어 원하는 다이어그램을 요청하기만 하면 됩니다.',
      stack: ['Vite', 'Canvas / GIF', 'AI-native'],
      link: 'https://github.com/yiwoduf/workflow-diagram-generator',
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
    { group: 'Languages', items: ['TypeScript', 'JavaScript', 'Python', 'PHP', 'Java'] },
    { group: 'Frontend', items: ['React', 'Next.js', 'Vite', 'TailwindCSS'] },
    { group: 'Backend & Data', items: ['Node.js', 'PostgreSQL', 'MySQL', 'Supabase', 'MongoDB'] },
    { group: 'AI & Agents', items: ['Claude', 'MCP', 'RAG', 'CAG', 'n8n', 'OpenClaw', 'OpenCode', 'Codex', 'Ollama'] },
    { group: 'Infra & Tools', items: ['Docker', 'Git', 'Vercel', 'Google Cloud'] },
  ],
};
