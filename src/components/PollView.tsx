import { RadioGroup, RadioGroupItem } from "./shadcn/ui/radio-group"
import { Button } from "./shadcn/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PollOptionResponse, PollResponse } from "@/pages/host/HostCreatePoll";

interface PollViewProps {
    poll?: PollResponse;
    roomID: string;
    isHost: boolean;
    onVoteSubmit?:  (optionId: number) => void;
    onClickViewResult?: () => void;
};

type PollOptionProps = {
    pollOptionView: PollOptionResponse;
    optionChecked: PollOptionResponse|null;
    setOptionChecked: (optionChecked: PollOptionResponse) => void;
};
 
export const PollView : React.FC<PollViewProps> = ({ poll, isHost, onVoteSubmit, onClickViewResult }) => {
    const [optionChecked, setOptionChecked] = useState<PollOptionResponse|null>(null);
    const [voted, setVoted] = useState<boolean>(false);

    function selectOption() {
        if(poll && optionChecked && onVoteSubmit) {
            onVoteSubmit(optionChecked.pollOptionId);
            setVoted(true);
        }
    }
    
    return (
        <div className="text-white justify-center w-full max-w-6xl mx-auto p-6">
            <form className="space-y-4 text-white">
                <div>
                    {/* RETRIEVE POLL QUESTION AND ITS OPTIONS */}
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">{poll?.pollQuestion}</h1>
                    <h2 className="text-xl md:text-2xl font-semibold mb-2">*Select the option you want to vote for and click "Submit Vote"</h2>
                    <RadioGroup 
                        onValueChange={() => optionChecked && setOptionChecked(optionChecked)}
                    >
                        <div className="flex items-center space-x-2 justify-center">
                        {poll?.pollOptionList.map((option, id) => 
                            <PollOptionView
                                key={id}
                                pollOptionView={option}
                                optionChecked={optionChecked}
                                setOptionChecked={setOptionChecked}
                            />
                        )}
                        </div>
                    </RadioGroup>
                </div>
                {/* CREATE VOTE BUTTON - ONLY FOR VIEWERS TO VOTE */}
                {!isHost &&
                    <Button
                        type="button"
                        variant="secondary"
                        className="w-1/2 py-2 font-alatsi"
                        disabled={optionChecked == null || voted}
                        onClick={selectOption}
                    >
                        Submit Vote
                    </Button>
                }
                
                {/* VIEW POLL RESULT BUTTON - ONLY FOR HOST TO VIEW RESULT OF ONGOING POLL */}
                {isHost &&
                    <div className="space-y-4">
                        <Button
                            type="button"
                            variant="default"
                            className="w-1/2 text-white py-2 font-alatsi border"
                            onClick={onClickViewResult}
                            >
                            View Poll Result
                        </Button>
                    </div>
                }
            </form>
            {voted && !isHost && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                <p>Thank you for voting!</p>
                </div>
            )}
      </div>
    );
};

export const PollOptionView = ({
    pollOptionView,
    optionChecked,
    setOptionChecked
}: PollOptionProps) => {
    const image = pollOptionView.imageUrl ?  "http://localhost:8080/pollOptionImages/" + pollOptionView.imageUrl : null;
    const [isOverflowing, setIsOverflowing] = useState(false);
    const descriptionRef = useRef<HTMLParagraphElement>(null);
    const [expanded, setExpanded] = useState(false);

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
      }, [pollOptionView.description]);

      function onClickReadMoreOrShowLess(e: any) {
        e.preventDefault();
        setExpanded(!expanded);
      }
    
    return (
        <div 
            style={{width: 250}}
            className={`${optionChecked?.value == pollOptionView.value ? 'bg-green-500' : 'bg-gray-800'} rounded-lg shadow-lg overflow-hidden flex flex-col h-full border border-gray-700`}
            onClick={() => setOptionChecked(pollOptionView)}
        >
            <RadioGroupItem
                style={{backgroundColor: "white"}}
                value={pollOptionView.value}
                id={"Option-" + pollOptionView.pollOptionId}
                hidden
            />
            <div className="p-4 flex-grow flex flex-col justify-between relative z-10 gap-6">
                {/* OPTION IMAGE */}
                {image && 
                    <div className="relative pt-[100%]">
                        <img 
                            src={image}
                            alt={pollOptionView.value} 
                            className="absolute top-0 left-0 w-full h-full object-cover object-top"
                            
                        />
                    </div>
                }
                <div className="x-4 flex flex-col justify-between relative z-10">
                    {/* OPTION VALUE */}
                    <h3 className={"font-semibold mb-2 text-white text-lg flex items-center"}>
                        <span>{pollOptionView.value}</span>
                    </h3>
                    {/* OPTION DESCRIPTION */}
                    {pollOptionView.description &&
                        <p 
                            ref={descriptionRef}
                            className={`text-white mb-2 text-sm ${expanded ? '' : 'line-clamp-2'}`}
                        >
                            {pollOptionView.description}
                        </p>
                    }
                    {/* DESCRIPTION OVERFLOW (READ MORE/SHOW LESS) */}
                    {pollOptionView.description && isOverflowing && (
                        <button 
                            onClick={onClickReadMoreOrShowLess} 
                            className="text-blue-600 text-sm flex items-center mt-1 hover:text-blue-300 relative z-20"
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
            </div>
        </div>
    );
};

export default PollView;