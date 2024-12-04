import { useAppContext } from "@/contexts/AppContext";
import { sendEmoji } from "@/utils/messaging-client";
import { uuid } from "@/utils/emoji-methods";
export interface EmojiReaction {}

export type Emoji = {
  TYPE: string;
  SESSION_ID: string;
  SENDER: string | undefined;
  ID: string;
};

const EmojiReaction = ({ roomID }: { roomID: string }) => {
  const { user } = useAppContext();

  const sendEmojiReaction = (emojiType: string, roomID: string) => {
    console.log("sending " + emojiType);

    const emoji = {
      TYPE: emojiType,
      SESSION_ID: roomID,
      SENDER: user?.username,
      ID: uuid(),
    };
    sendEmoji(emoji);
  };

  const emojiList = [
    { emoji: "🙂", label: "Smiley Face" },
    { emoji: "😂", label: "Laughing Face" },
    { emoji: "😘", label: "Kissing Face" },
    // { emoji: "😭", label: "Crying Face" },
    { emoji: "😮", label: "Shock Face" },
    { emoji: "😱", label: "Scared Face" },
    { emoji: "😡", label: "Angry Face" },
    { emoji: "🩷", label: "Heart" },
    { emoji: "👍", label: "Thumbs Up" },
  ];

  return (
    <>
      <div className="text-4xl md:text-2xl my-4">
        {emojiList.map(({ emoji, label }, index) => (
          <button key={index} onClick={() => sendEmojiReaction(emoji, roomID)}>
            {emoji}
          </button>
        ))}
      </div>
    </>
  );
};

export default EmojiReaction;
