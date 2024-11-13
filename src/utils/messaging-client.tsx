import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import * as apiClient from "@/utils/api-client";
import { Message } from "@/components/LiveChat";
import { Emoji } from "@/components/EmojiReaction";
import { ComponentItem, ModuleAction } from "@/pages/EventPage";
import Module from "module";
import { StatusMessage } from "@/pages/ViewerPage";

export interface MessagingClientOptions {
  roomID: string;
  onMessageReceived: (message: Message) => void; // Callback for when a new message is received
}

export interface EmojiClientOptions {
  roomID: string;
  onReceived: (emoji: Emoji) => void;
}

export interface ModuleClientOptions {
  roomID: string;
  onReceived: (action: ModuleAction) => void;
  goLive: (isLive: boolean) => void;
}

export interface StreamClientOptions {
  roomID: string;
  onReceived: (status: StatusMessage) => void;
}

let client: any = null;
let emojiClient: any = null;
let moduleClient: any = null;
let streamClient: any = null;

/**
 * Initializes WebSocket connection and subscribes to the chat topic
 */
export const initWebSocketConnection = (options: MessagingClientOptions) => {
  const { roomID, onMessageReceived } = options;

  const userToken = localStorage.getItem("watchparty-token");

  let token = userToken?.substring(1, userToken.length - 1);

  // Set up WebSocket connection
  const brokerURL = `http://localhost:8080/chat?token=${token}&roomID=${roomID}`;
  if (!client || !client.connected) {
    client = Stomp.over(() => new SockJS(brokerURL));
    client.reconnectDelay = 5000; // Try to reconnect every 5 seconds

    client.connect({}, () => {
      const topic = `/topic/chat/${roomID}`;
      console.log(`Listening to: ${topic}`);

      client.subscribe(topic, (message: any) => {
        const newMessage = JSON.parse(message.body);
        console.log(
          `NewMessage: ${newMessage.content} | ID: ${newMessage.messageID} | Timestamp: ${newMessage.timeStamp}`
        );

        // Call the callback with the new message
        onMessageReceived(newMessage);
      });
    });
  }

  return () => {
    if (client && client.connected) {
      client.disconnect(() => {
        console.log("Disconnected from WebSocket");
      });
      client = null;
    }
  };
};

/**
 * Fetches past messages for the room
 */
export const getPastMessages = async (roomID: string): Promise<Message[]> => {
  try {
    const pastMessages: Message[] =
      await apiClient.getChatMessagesByRoomID(roomID);
    return pastMessages;
  } catch (error) {
    console.error("Failed to fetch past messages:", error);
    return []; // Return an empty array on failure
  }
};

export const sendMessageToChat = async (message: any) => {
  if (client && client.connected) {
    client.send("/app/chat", {}, JSON.stringify(message));
  }
  console.log(message);
};

export const sendEmoji = async (reaction: Emoji) => {
  if (emojiClient && emojiClient.connected) {
    emojiClient.send("/app/emoji", {}, JSON.stringify(reaction));
  }
};

export const EmojiConnection = (options: EmojiClientOptions) => {
  const { roomID, onReceived } = options;

  const userToken = localStorage.getItem("watchparty-token");

  let token = userToken?.substring(1, userToken.length - 1);

  // Set up WebSocket connection
  // Avoid re-initializing the WebSocket connection if already connected
  if (!emojiClient || !emojiClient.connected) {
    emojiClient = Stomp.over(
      () =>
        new SockJS(
          `http://localhost:8080/emoji?token=${token}&roomID=${roomID}`
        )
    );
    emojiClient.reconnectDelay = 5000; // Reconnect every 5 seconds if disconnected

    emojiClient.connect({}, () => {
      const topic = `/topic/emoji/${roomID}`;
      console.log(`Subscribed to: ${topic}`);

      // Subscribe to the emoji topic
      emojiClient.subscribe(topic, (message: any) => {
        const newEmoji = JSON.parse(message.body);
        console.log(message.body);
        console.log(`New Emoji received: ${newEmoji.TYPE}`);

        // Construct the emoji object
        // const constructedEmoji: Emoji = {
        //   TYPE: newEmoji.type,
        //   SESSION_ID: newEmoji.session_ID,
        //   SENDER: newEmoji.sender,
        //   ID: newEmoji.id,
        // };

        // Trigger the callback with the new emoji
        onReceived(newEmoji);
      });
    });
  }

  return () => {
    if (emojiClient && emojiClient.connected) {
      emojiClient.disconnect(() => {
        console.log("Disconnected from WebSocket - emojiClient");
      });
      emojiClient = null;
    }
  };
};

export const ModuleConnection = (options: ModuleClientOptions) => {
  const { roomID, onReceived } = options;
  const userToken = localStorage.getItem("watchparty-token");
  let token = userToken?.substring(1, userToken.length - 1);

  if (!moduleClient || !moduleClient.connected) {
    moduleClient = Stomp.over(
      () => new SockJS(`http://localhost:8080/moduleAction?roomID=${roomID}`)
    );
    moduleClient.reconnectDelay = 5000;

    moduleClient.connect(
      {},
      () => {
        const topic = `/topic/moduleAction/${roomID}`;
        console.log(`Connected and subscribed to: ${topic}`);
        moduleClient.subscribe(topic, (message: any) => {
          console.log(message);
          const newAction = JSON.parse(message.body);
          console.log(`New ModuleAction received: ${newAction.TYPE}`);
          onReceived(newAction);
        });
      },
      (error: Error) => {
        console.error("WebSocket connection error:", error);
      }
    );
  }

  return () => {
    if (moduleClient && moduleClient.connected) {
      moduleClient.disconnect(() =>
        console.log("Disconnected from WebSocket - moduleClient")
      );
      moduleClient = null;
    }
  };
};

export const sendModuleAction = async (action: ModuleAction) => {
  if (moduleClient && moduleClient.connected) {
    console.log("Sending module action:", action);
    moduleClient.send("/app/moduleAction", {}, JSON.stringify(action));
  } else {
    moduleClient = Stomp.over(
      () =>
        new SockJS(
          `http://localhost:8080/moduleAction?roomID=${action.SESSION_ID}`
        )
    );
    moduleClient.connect({}, () => {
      console.log("Reconnected and sending module action:", action);
      moduleClient.send("/app/moduleAction", {}, JSON.stringify(action));
    });
  }
};

export const StreamConnection = (options: StreamClientOptions) => {
  const { roomID, onReceived } = options;
  const userToken = localStorage.getItem("watchparty-token");
  let token = userToken?.substring(1, userToken.length - 1);

  if (!streamClient || !streamClient.connected) {
    streamClient = Stomp.over(
      () => new SockJS(`http://localhost:8080/streamStatus?roomID=${roomID}`)
    );
    streamClient.reconnectDelay = 5000;

    streamClient.connect(
      {},
      () => {
        const topic = `/topic/streamStatus/${roomID}`;
        console.log(`Connected and subscribed to: ${topic}`);

        // Subscribe to the stream status topic
        streamClient.subscribe(topic, (message: any) => {
          const statusMessage = JSON.parse(message.body);
          console.log(`New StatusMessage received: ${statusMessage.TYPE}`);
          onReceived(statusMessage);
        });

        // Notify the server of a new viewer joining
        sendStreamStatus({
          TYPE: "VIEWER_JOIN",
          SESSION_ID: roomID,
        });
      },
      (error: Error) => {
        console.error("WebSocket connection error:", error);
      }
    );
  }

  return () => {
    if (streamClient && streamClient.connected) {
      // Notify the server when a viewer leaves
      sendStreamStatus({
        TYPE: "VIEWER_LEAVE",
        SESSION_ID: roomID,
      });

      streamClient.disconnect(() => {
        console.log("Disconnected from WebSocket - streamClient");
      });
      streamClient = null;
    }
  };
};

export const sendStreamStatus = async (status: StatusMessage) => {
  if (streamClient && streamClient.connected) {
    console.log("Sending status message:", status);
    streamClient.send("/app/streamStatus", {}, JSON.stringify(status));
  }
};
