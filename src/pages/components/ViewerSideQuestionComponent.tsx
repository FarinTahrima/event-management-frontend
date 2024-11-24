import React, { useEffect, useState } from 'react';
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { ChevronUp, MessageSquarePlus, Clock, MessageCircleQuestion } from "lucide-react";
import { useQuestions } from '../../contexts/QuestionContext';
import { Question } from '@/types/types';
import { InteractiveQAAction, InteractiveQAConnection, sendInteractiveQAAction } from '@/utils/messaging-client';

interface QuestionComponentProps {
  isLive: boolean;
  roomId: string;
}

const ViewerSideQuestionComponent: React.FC<QuestionComponentProps> = ({ isLive, roomId }) => {
  const { questions, moderateQuestion } = useQuestions();
  const [newQuestion, setNewQuestion] = useState('');
  const [questionList, setQuestionList] = useState<Question[]>(questions);

  useEffect(() => {
    const cleanupWebSocket = InteractiveQAConnection({
      roomID: roomId ?? "",
      onReceived: (action: InteractiveQAAction) => {
        console.log("Received Action:", action);
      }
    });
    return cleanupWebSocket;
  }, [roomId]);

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {

      moderateQuestion(newQuestion.trim())
        .then(result => {
            if (result) {
                console.log("Moderated question:", result);
                setNewQuestion('');
                sendInteractiveQAAction({
                  SESSION_ID: roomId,
                  TYPE: "send_question_to_host",
                  QUESTION: JSON.stringify(result)
                });
            } else {
                console.error("Failed to moderate the question");
            }
        })
        .catch(error => {
            console.error("Error moderating the question:", error);
        });
    }
  };

  useEffect(() => {
    console.log("questions view", questions);
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea === localStorage && event.key === "questions") {
        try {
          if (event.newValue) {
            const list: Question[] = JSON.parse(event.newValue);
            setQuestionList(list);
          } else {
            console.log("Storage key cleared or empty");
            setQuestionList([]); // Reset to an empty array if value is cleared
          }
        } catch (error) {
          console.error("Error parsing storage data:", error);
        }
      }
    };

    // Attach the storage event listener
    window.addEventListener('storage', handleStorageChange);

    // Cleanup on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [questions]); // Runs once when the component mounts

  const handleVote = (question: Question) => {
    sendInteractiveQAAction({
      SESSION_ID: roomId,
      TYPE: "vote_for_question",
      QUESTION: JSON.stringify(question)
    });
  }

  return (
    <div className="flex flex-col h-full relative">
       {/* Header - Fixed at top */}
       <div className="sticky top-0 z-10 p-4 border-b border-gray-800 bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold flex items-center gap-2 text-white">
            {/* <Bird className="h-6 w-6 text-blue-400" /> */}
            <MessageCircleQuestion className="h-6 w-6 text-blue-400" />
            Live Q&A
          </h3>
        </div>
      </div>

      {!isLive &&
        <p className="text-gray-400 p-4 align-center">
          Waiting for presenter to share content...
        </p>
      }

      {/* Questions List - Scrollable middle section */}
      {isLive &&
          <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 p-4">
            {questionList.map((question) => (
              <Card
                key={question.id}
                className={`p-4 transition-all duration-200 cursor-pointer ${
                  question.isSelected
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >
                <div className="flex gap-4">
                  <Button
                    variant={question.hasVoted ? "secondary" : "ghost"}
                    size="sm"
                    className={`flex flex-col items-center min-w-[60px] text-white ${
                      question.hasVoted ? "bg-blue-500 hover:bg-blue-600" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(question);
                    }}
                  >
                    <ChevronUp className="h-5 w-5" />
                    <span className="text-sm font-semibold">
                      {question.votes}
                    </span>
                  </Button>
                  <div className="flex-1">
                    <p className="text-md text-white">{question.text}</p>
                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(question.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      }

      {/* Question Input - Fixed at bottom */}
      {isLive && 
        <div className="sticky bottom-0 z-10 p-4 border-t border-gray-800 bg-gray-800">
          <form onSubmit={handleSubmitQuestion} className="flex gap-2">
            <Input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 bg-gray-700 border-gray-600 focus:border-blue-500 focus:ring-blue-500"
            />
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <MessageSquarePlus className="h-5 w-5 mr-2" />
              Ask
            </Button>
          </form>
      </div>
      }
    </div>
    
  );
};

export default ViewerSideQuestionComponent;
