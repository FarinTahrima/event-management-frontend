import { useEffect, useRef } from "react";
import { Message } from '../types/types';
import { ScrollArea } from "./shadcn/ui/scroll-area";

interface ChatHistoryProps {
  chatMessages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Create a map to track seen messages and ensure uniqueness
  const uniqueMessages = chatMessages.reduce((acc: Message[], current: Message) => {
    const exists = acc.find(msg => msg.messageID === current.messageID);
    if (!exists) {
      acc.push(current);
    }
    return acc;
  }, []);

  return (
    <ScrollArea className="h-96">
      <div className="px-2 my-4">
        {uniqueMessages.map((msg: Message, index: number) => (
          <p
            key={`${msg.messageID}-${index}`}
            className="my-2 text-[#A8A8A8] text-wrap text-start"
          >
            <strong>{msg.sender}</strong>: {msg.content}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatHistory;

