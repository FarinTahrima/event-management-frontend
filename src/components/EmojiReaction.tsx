import { useAppContext } from "@/contexts/AppContext";
import { sendEmoji } from "@/utils/messaging-client";
import { useState } from "react";
import { toast } from "./ui/use-toast";
import { Switch } from "./ui/switch";
import { uuid } from "@/utils/emoji-methods";
import { EMOJI_ClICK_COOLDOWN } from "@/utils/constants";
export interface EmojiReaction {}

export type Emoji = {
  TYPE: string;
  SESSION_ID: string;
  SENDER: string | undefined;
  ID: string;
};

const EmojiReaction = ({ roomID }: { roomID: string }) => {
  const { user } = useAppContext();
  const [waiting, setWaiting] = useState<boolean>(false);
  const [enableCooldown, setEnableCooldown] = useState<boolean>(false);
  const EMOJI_COOLDOWN_TIME = EMOJI_ClICK_COOLDOWN;

  const emojiCoolDown = () => {
    setWaiting(true);
    setTimeout(() => {
      setWaiting(false);
    }, EMOJI_COOLDOWN_TIME);
  };

  const sendEmojiReaction = (emojiType: string, roomID: string) => {
    if (waiting) {
      toast({
        title: "Please wait",
        description: `You can only send one emoji every ${EMOJI_COOLDOWN_TIME / 1000} seconds`,
        duration: 5000,
      });
      return;
    }

    if (enableCooldown) {
      emojiCoolDown();
    } // start timeout for next emoji

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
    { emoji: "😭", label: "Crying Face" },
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
      <div className="flex items-center space-x-2 text-[#A8A8A8] font-semibold">
        <Switch
          id="emoji-cooldown"
          onCheckedChange={() => setEnableCooldown(!enableCooldown)}
        />
        <label htmlFor="emoji-cooldown">Enable Emoji Cooldown</label>
      </div>
    </>
  );
};

export default EmojiReaction;
