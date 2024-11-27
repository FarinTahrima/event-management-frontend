import { useRef } from "react";
import { Message } from "../types/types";
import { ScrollArea } from "./shadcn/ui/scroll-area";

interface ChatHistoryProps {
  chatMessages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  return (
    <ScrollArea className="min-h-[18rem]">
      <div className="px-2 my-4">
        {chatMessages.map((msg: Message) => (
          <p
            key={msg.messageID}
            className="my-2 text-[#A8A8A8] text-wrap text-start text-xl"
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
