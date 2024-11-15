import { useEffect, useState } from "react";
import ChatInput from "./ChatInput";
import { LoadingSpinner } from "./LoadingSpinner";
import ChatHistory from "./ChatHistory";
import EmojiOverlay from "./EmojiOverlay";
import EmojiReaction from "./EmojiReaction";
import { MessageSquare } from "lucide-react";
import {
  initWebSocketConnection,
  getPastMessages,
} from "@/utils/messaging-client";
import { useParams } from "react-router-dom";

export interface Message {
  messageID: number;
  content: string;
  sender: string;
  timeStamp: Date;
  type: string;
}

const LiveChat = () => {
  const [messages, setMessages] = useState<Message[]>([]); // messages state
  const [messageToSend, setMessageToSend] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false); // To handle loading state
  const TRANSITION_DURATION_MS = 500; // fixed transition period in milliseconds
  const { roomId } = useParams();

  var roomID = roomId || "";

  useEffect(() => {
    const fetchMessagesAndSubscribe = async () => {
      setIsLoading(false); // Start loading // TODO: change to true only outside of FDM
      // Fetch past messages
      try {
        const pastMessages = await getPastMessages(roomID);
        setMessages(pastMessages);
      } catch (error) {
        console.error("Error fetching past messages:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false); // End loading
        }, TRANSITION_DURATION_MS);
      }

      const disconnectConnection = initWebSocketConnection({
        roomID: roomID,
        onMessageReceived: (newMessage) => {
          console.log(`Adding new message: ${newMessage}`);
          setMessages((prevMessages) => [...prevMessages, newMessage]);
        },
      });
      return () => {
        disconnectConnection();
      };
    };
    fetchMessagesAndSubscribe();
  }, [roomID]); // re-subscribe when roomID changes

  return (
    <div className="px-2 flex flex-col min-h-96 min-w-80 bg-[#161616]">
      {/* Component title and icons */}
      <div className="flex flex-row flex-wrap justify-between p-2 pt-4 border border-0 border-b-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-stone-50" />
          <h2 className="font-alatsi text-stone-50 text-lg">Live Chat</h2>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col justify-center items-center bg-black bg-opacity-70">
          <h2 className="text-s font-bold font-alatsi">Loading</h2>
          <LoadingSpinner className="size-12 my-2" />
        </div>
      )}

      <div
        className={`${isLoading ? "opacity-50" : "opacity-100"} transition-opacity duration-${TRANSITION_DURATION_MS}`}
      >
        <div className="relative">
          <ChatHistory chatMessages={messages} />
          <EmojiOverlay roomID={roomID} />
        </div>
        <EmojiReaction roomID={roomID} />
        <ChatInput
          messageToSend={messageToSend}
          setMessageToSend={setMessageToSend}
          roomID={roomID}
        />
      </div>
    </div>
  );
};

export default LiveChat;
