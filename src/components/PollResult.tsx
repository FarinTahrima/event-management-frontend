import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { PollOptionResponse, PollResponse } from '@/pages/host/HostCreatePoll';
import { Button } from './shadcn/ui/button';

interface PollResultProps {
    poll: PollResponse;
    totalVotes: number;
    isHost: boolean;
    changeToResult?: () => void;
}

const PollOptionCard: React.FC<{ pollOption: PollOptionResponse; totalVotes: number; place: number }> = ({ pollOption, totalVotes }) => {
  const [expanded, setExpanded] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const votePercentage = totalVotes > 0 ? (pollOption.voteCount / totalVotes) * 100 : 0;

  useEffect(() => {
    const checkOverflow = () => {
      if (descriptionRef.current) {
        setIsOverflowing(
          descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight
        );
      }
    };

    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [pollOption.description]);

  const imageUrl = pollOption.imageUrl ? "http://localhost:8080/pollOptionImages/" + pollOption.imageUrl : null;

  return (
    <div className={"bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-gray-700 transform hover:scale-105 transition-transform duration-300"}>
      {imageUrl &&
        <div className="relative pt-[100%]"> 
          <img 
            src={imageUrl} 
            alt={pollOption.value}
            className="absolute top-0 left-0 w-full h-full object-cover object-top"
          />
        </div>
      }
      <div className="p-4 flex-grow flex flex-col justify-between relative z-10">
        <div>
          <h3 className={"font-semibold mb-2 text-white text-xl flex items-center"}>
            <span>{pollOption.value}</span>
          </h3>
          {pollOption.description &&
          <p
            ref={descriptionRef}
            className={`text-gray-400 mb-2 text-base ${expanded ? '' : 'line-clamp-2'}`}
          >
            {pollOption.description}
          </p>
          }
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
          <div className="mt-2 flex justify-between items-center">
            <span className={"font-medium text-gray-300 text-sm"}>{pollOption.voteCount} votes</span>
            <span className={"font-medium text-gray-300 text-sm"}>{votePercentage.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const PollResult: React.FC<PollResultProps> = ({ poll, isHost, changeToResult}) => {
  const totalVotes = poll.pollOptionList.reduce((sum, option) => sum + option.voteCount, 0);
  const sortedOptions = [...poll.pollOptionList].sort((a, b) => b.voteCount - a.voteCount);

  return (
    <div className="text-white">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Poll Result</h1>
        <h2 className="text-xl md:text-2xl font-semibold mb-2">{poll?.pollQuestion}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedOptions.map((option, index) => (
            <PollOptionCard key={index} pollOption={option} totalVotes={totalVotes} place={index + 1} />
            ))}
        </div>
        <div className="space-y-4">
          {isHost && (
            <Button
                type="button"
                variant="default"
                className="w-1/2 text-white py-2 font-alatsi border"
                onClick={changeToResult}
            >
              Share Poll Result
            </Button>
          )}
        </div>
    </div>
  );
};

export default PollResult;