import type { ReactElement } from 'react';
import { cx } from '../../lib/cx';
import type { ChatMessageT } from './types';
import { SimonAvatar } from './SimonAvatar';
import { parseAssistantContent } from './linkCards';

interface ChatMessageProps {
  onOpenMeeting: () => void;
  message: ChatMessageT;
  isStreaming: boolean;
}

/** Renders a single chat bubble — user (right) or assistant (left). */
export function ChatMessage({ message, isStreaming, onOpenMeeting }: ChatMessageProps): ReactElement {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div className="chat-msg chat-msg--user">
        <div className="chat-bubble chat-bubble--user">
          <span>{message.content}</span>
        </div>
      </div>
    );
  }

  const isEmpty = message.content === '' && isStreaming;

  return (
    <div className={cx('chat-msg', 'chat-msg--assistant')}>
      <span className="chat-avatar-wrap">
        <SimonAvatar className="chat-avatar" />
      </span>
      <div className="chat-bubble chat-bubble--assistant">
        {isEmpty ? (
          <span className="chat-typing" aria-hidden="true">
            <span className="chat-dot" />
            <span className="chat-dot" />
            <span className="chat-dot" />
          </span>
        ) : (
          <span className="chat-text">
            {parseAssistantContent(message.content, onOpenMeeting)}
          </span>
        )}
      </div>
    </div>
  );
}
