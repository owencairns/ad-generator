import { FC } from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
}

const ChatMessage: FC<ChatMessageProps> = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-primary-content'
            : 'bg-base-200 text-base-content'
        }`}
      >
        <p className="whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage; 