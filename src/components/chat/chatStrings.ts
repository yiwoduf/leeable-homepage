import type { ChatLang } from './types';

interface ChatStrings {
  /** aria-label for the launcher button */
  launcherAria: string;
  /** Panel header title */
  panelTitle: string;
  /** Panel header subtitle */
  panelSubtitle: string;
  /** Greeting shown as a static bubble above the message list (not stored in state) */
  greeting: string;
  /** Input placeholder */
  inputPlaceholder: string;
  /** aria-label for the send button */
  sendAria: string;
  /** aria-label for the stop-generation button (shown while streaming) */
  stopAria: string;
  /** aria-label for the close button */
  closeAria: string;
  /** Generic error message */
  errorGeneric: string;
  /** Rate-limit error */
  errorRateLimited: string;
  /** Backend offline / unconfigured — user-friendly, no internal details */
  errorOffline: string;
  /** Session message limit reached notice */
  sessionLimitReached: string;
  /** Character counter pattern — {n} replaced with count, {max} with limit */
  charCounterPattern: string;
  /** aria-live text while streaming */
  typingAria: string;
  /** Status dot tooltip when online */
  statusOnline: string;
  /** Status dot tooltip when offline */
  statusOffline: string;
}

/** Localised strings for both supported languages. */
export const CHAT_STRINGS: Record<ChatLang, ChatStrings> = {
  en: {
    launcherAria: 'Chat with Simon',
    panelTitle: 'Simon',
    panelSubtitle: "Peter (Jaeyol)'s assistant",
    greeting:
      "Hi, I'm Simon — Peter (Jaeyol)'s portfolio assistant. Ask me anything about his work, experience, or how to get in touch.",
    inputPlaceholder: 'Ask me anything…',
    sendAria: 'Send message',
    stopAria: 'Stop generating',
    closeAria: 'Close chat',
    errorGeneric:
      "Sorry, something went wrong on my end. Please try again in a moment.",
    errorRateLimited:
      "You've sent a lot of messages — please try again in a little while.",
    errorOffline:
      "Simon is offline right now — please try again later, or reach out by email.",
    sessionLimitReached:
      "You've reached the message limit for this session. Feel free to reach out directly via email or LinkedIn!",
    charCounterPattern: '{n} / {max}',
    typingAria: 'Simon is typing…',
    statusOnline: 'Online',
    statusOffline: 'Offline',
  },
  ko: {
    launcherAria: 'Simon에게 물어보기',
    panelTitle: 'Simon',
    panelSubtitle: '이재열 대표님의 비서',
    greeting:
      '안녕하세요, 저는 이재열 대표님의 비서 Simon입니다. 대표님의 경력이나 프로젝트, 연락 방법까지 무엇이든 편하게 물어보세요.',
    inputPlaceholder: '무엇이든 물어보세요…',
    sendAria: '메시지 전송',
    stopAria: '생성 중단',
    closeAria: '채팅 닫기',
    errorGeneric:
      '죄송합니다, 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    errorRateLimited: '메시지를 너무 많이 보내셨어요. 잠시 후 다시 시도해주세요.',
    errorOffline:
      '현재 Simon을 이용할 수 없습니다. 잠시 후 다시 시도하거나 이메일로 직접 연락해주세요.',
    sessionLimitReached:
      '이 세션의 메시지 한도에 도달했습니다. 이메일이나 LinkedIn으로 직접 연락해주세요!',
    charCounterPattern: '{n} / {max}',
    typingAria: 'Simon이 입력 중…',
    statusOnline: '온라인',
    statusOffline: '오프라인',
  },
};
