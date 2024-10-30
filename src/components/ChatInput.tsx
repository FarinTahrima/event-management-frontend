import { sendMessageToChat } from "@/utils/messaging-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAppContext } from "@/contexts/AppContext";

interface ChatInputProps {
  messageToSend: string;
  setMessageToSend: (message: string) => void;
  roomID: string;
}

const ChatInput = ({
  messageToSend,
  setMessageToSend,
  roomID,
}: ChatInputProps) => {
  const { user } = useAppContext();
  const sendMessage = (message: string) => {
    if (message.trim() !== "") {
      const messagePayload = {
        type: "CHAT",
        content: message,
        sender: user?.username || "anon",
        sessionId: roomID,
      };
      sendMessageToChat(messagePayload);
      setMessageToSend(""); // Clear input after sending
    }
  };

  return (
    <form
      className="px-1 my-4 flex flex-row gap-x-3 justify-between order-last"
      onSubmit={(event) => {
        event.preventDefault();
        sendMessage(messageToSend);
      }}
    >
      <div className="w-full">
        <Input
          type="text"
          value={messageToSend}
          onChange={(event) => setMessageToSend(event.target.value)}
          className="bg-black font-sans font-medium text-[#A8A8A8] border-none"
          placeholder="Type something ..."
        ></Input>
      </div>
      <div className="order-last">
        <Button className="bg-[#11061F] hover:bg-[#A8A8A8] " type="submit">
          Send
        </Button>
      </div>
    </form>
  );
};

export default ChatInput;
