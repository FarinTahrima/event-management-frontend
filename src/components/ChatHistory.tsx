import { useRef } from "react";
import { Message } from "./LiveChat";
import { ScrollArea } from "./ui/scroll-area";

interface ChatHistoryProps {
  chatMessages: Message[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ chatMessages }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // const scrollToBottom = () => {
  //   setTimeout(() => {
  //     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  //   }, 0);
  // };

  // useEffect(() => {
  //   scrollToBottom();
  // }, [chatMessages]);

  return (
    <ScrollArea className="h-96">
      <div className="px-2 my-4">
        {chatMessages.map((msg: Message) => (
          <p
            key={msg.messageID}
            className="my-2 text-[#A8A8A8] text-wrap text-start"
          >
            <strong>{msg.sender}:</strong> {msg.content}
          </p>
        ))}
      </div>
      <div ref={messagesEndRef} />
    </ScrollArea>
  );
};

export default ChatHistory;
