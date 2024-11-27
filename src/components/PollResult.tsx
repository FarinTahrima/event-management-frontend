import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PollOptionResponse, PollResponse } from "@/pages/host/HostCreatePoll";
import { Button } from "./shadcn/ui/button";

interface PollResultProps {
  poll: PollResponse;
  isHost: boolean;
  changeToResult?: () => void;
  changeToView?: () => void;
}

const PollOptionCard: React.FC<{
  pollOption: PollOptionResponse;
  totalVotes: number;
  place: number;
}> = ({ pollOption, totalVotes }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const votePercentage =
    totalVotes > 0 ? (pollOption.voteCount / totalVotes) * 100 : 0;

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        setIsOverflowing(
          descriptionRef.current.scrollHeight >
            descriptionRef.current.clientHeight
        );
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [pollOption.description]);

  const imageUrl = pollOption.imageUrl
    ? "http://localhost:8080/pollOptionImages/" + pollOption.imageUrl
    : null;

  return (
    <div
      className={
        "bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-gray-700 transform hover:scale-105 transition-transform duration-300"
      }
    >
      {imageUrl && (
        <div className="relative pt-[100%]">
          <img
            src={imageUrl}
            alt={pollOption.value}
            className="absolute top-0 left-0 w-full h-full object-cover object-top"
          />
        </div>
      )}
      <div className="p-2 flex-grow flex flex-col justify-between relative z-10">
        <div>
          <p className={"font-semibold text-white text-xl flex items-center"}>
            <span>{pollOption.value}</span>
          </p>
          {pollOption.description && (
            <p
              ref={descriptionRef}
              className={`text-gray-400 text-base ${expanded ? "" : "line-clamp-2"}`}
            >
              {pollOption.description}
            </p>
          )}
          {isOverflowing && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-400 text-sm flex items-center mt-1 hover:text-blue-300 relative z-20"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} className="mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="mr-1" />
                  Read more
                </>
              )}
            </button>
          )}
        </div>
        <div>
          <div className="flex justify-between items-center">
            <span className={"font-medium text-gray-300 text-sm"}>
              {pollOption.voteCount} votes
            </span>
            <span className={"font-medium text-gray-300 text-sm"}>
              {votePercentage.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PollResult: React.FC<PollResultProps> = ({
  poll,
  isHost,
  changeToResult,
  changeToView,
}) => {
  const totalVotes = poll.pollOptionList.reduce(
    (sum, option) => sum + option.voteCount,
    0
  );
  const sortedOptions = [...poll.pollOptionList].sort(
    (a, b) => b.voteCount - a.voteCount
  );
  const [isPollShared, setIsPollShared] = useState<boolean>(false);

  const toggleViewAndResult = () => {
    if (isPollShared && changeToView) {
      changeToView();
      setIsPollShared(false);
    }

    if (!isPollShared && changeToResult) {
      changeToResult();
      setIsPollShared(true);
    }
  };

  return (
    <div className="text-white justify-center w-full max-w-6xl mx-auto p-4">
      <p className="text-xl md:text-xl font-bold mb-2">{poll?.pollQuestion}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
        {sortedOptions.map((option, index) => (
          <PollOptionCard
            key={index}
            pollOption={option}
            totalVotes={totalVotes}
            place={index + 1}
          />
        ))}
      </div>
      <div className="space-y-1">
        {isHost && (
          <Button
            type="button"
            variant="default"
            className="w-1/2 text-white py-2 font-alatsi border"
            onClick={toggleViewAndResult}
          >
            {isPollShared ? "Back to Voting" : "Share Poll Result"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PollResult;
