import React, { useEffect, useState } from 'react';
import PollResult from '@/components/PollResult';
import PollView from '@/components/PollView';
import { PollResponse } from '../host/HostCreatePoll';
import { LivePollAction, LivePollConnection, sendLivePollAction } from '@/utils/messaging-client';
import { Poll } from '@/data/componentData';

interface PollComponentProps {
  roomId: string;
  isHost: boolean;
}

const PollComponent: React.FC<PollComponentProps> = ({ roomId, isHost }) => {
  const [poll, setPoll] = useState<PollResponse>(Poll);
  const [pollMode, setPollMode] = useState<"vote" | "result">("vote");
  
  useEffect(() => {
    const cleanupWebSocket = LivePollConnection({
      roomID: roomId ?? "",
      onReceived: (action: LivePollAction) => {
        console.log("Received LivePollAction:", action);
        if (action.TYPE == "poll_vote" && action.POLL) {
          setPoll(JSON.parse(action.POLL));
        }
        else if (action.TYPE === "poll_result" && action.POLL) {
          setPoll(JSON.parse(action.POLL));
          setPollMode("result");
        }
        else if (action.TYPE === "poll_view" && action.POLL) {
          setPoll(JSON.parse(action.POLL));
          setPollMode("vote");
        }
      }
    });
    return cleanupWebSocket;
  }, [roomId]);

  const changeToResult = () => {
    console.log("to switch poll to result view for viewers");
    sendLivePollAction({
      SESSION_ID: roomId ?? "",
      TYPE: "poll_result",
      IS_HOST: false,
      POLL: JSON.stringify(poll),
    })
  }

  const changeToPollView = () => {
    console.log("to switch to poll view for viewers");
    sendLivePollAction({
      SESSION_ID: roomId ?? "",
      TYPE: "poll_view",
      IS_HOST: false,
      POLL: JSON.stringify(poll),
    })
    setPollMode("vote");
  };

  const onVoteSubmit = (optionId: number) => {
    console.log("voting for " + optionId);
    poll.pollOptionList.filter(option => optionId == option.pollOptionId).forEach(
      function(op) {
        op.voteCount = op.voteCount + 1;
      }
    );
    sendLivePollAction({
      SESSION_ID: roomId ?? "",
      TYPE: "poll_vote",
      IS_HOST: false,
      POLL: JSON.stringify(poll)
    })
  };

  return (
    <div>
      {pollMode === "result" && (
        <PollResult 
          poll={poll}
          isHost={isHost}
          changeToResult={changeToResult}
          changeToView={changeToPollView}
        />
      )}
      {pollMode === "vote" && (
        <PollView
          poll={poll}
          roomID={roomId}
          isHost={isHost}
          onClickViewResult={() => setPollMode("result")}
          onVoteSubmit={onVoteSubmit}
        />
      )}
    </div>
   
  );
};

export default PollComponent;