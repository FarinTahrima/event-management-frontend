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

interface Message {
  content: string;
  messageID: string;
  sender: string;
  timestamp?: Date;
}

interface MessageWithSentiment extends Message {
  sentiment?: {
    label: string;
    score: number;
  };
}

const LiveChat = () => {
  // Properly type the state
  const [messages, setMessages] = useState<MessageWithSentiment[]>([]); 
  const [messageToSend, setMessageToSend] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const TRANSITION_DURATION_MS = 500;
  const { roomId } = useParams();

  const roomID = roomId || "";

  const analyzeSentiment = async (message: Message) => {
    try {
      const response = await fetch('http://localhost:3000/analyze-sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message.content,
          messageId: message.messageID,
        }),
      });
      
      const data = await response.json();
      return data.sentiment;
    } catch (error) {
      console.error('Error analyzing sentiment:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchMessagesAndSubscribe = async () => {
      setIsLoading(true);
      try {
        const pastMessages = await getPastMessages(roomID);
        // Analyze sentiment for past messages
        const messagesWithSentiment = await Promise.all(
          pastMessages.map(async (message: Message) => ({
            ...message,
            sentiment: await analyzeSentiment(message),
          }))
        );
        setMessages(messagesWithSentiment);
      } catch (error) {
        console.error("Error fetching past messages:", error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, TRANSITION_DURATION_MS);
      }

      const disconnectConnection = initWebSocketConnection({
        roomID: roomID,
        onMessageReceived: async (newMessage: Message) => {
          const sentiment = await analyzeSentiment(newMessage);
          const messageWithSentiment: MessageWithSentiment = {
            ...newMessage,
            sentiment,
          };
          setMessages((prevMessages) => [...prevMessages, messageWithSentiment]);
        },
      });
      return () => {
        disconnectConnection();
      };
    };
    fetchMessagesAndSubscribe();
  }, [roomID]);

  return (
    <div className="px-2 flex flex-col min-h-96 min-w-80 bg-[#161616]">
      <div className="flex flex-row flex-wrap justify-between p-2 pt-4 border border-0 border-b-2">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-stone-50" />
          <h2 className="font-alatsi text-stone-50 text-lg">Live Chat</h2>
        </div>
      </div>

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

