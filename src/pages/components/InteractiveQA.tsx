import React, { useEffect, useState } from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import { Card } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { ChevronUp, Clock, Trash2, CheckCircle, XCircle } from "lucide-react";
import { Question } from '../../types/types';
import { InteractiveQAAction, InteractiveQAConnection, sendInteractiveQAAction } from '@/utils/messaging-client';

interface InteractiveQAProps {
    roomId: string;
    isHost: boolean;
}

interface SelectedQuestionProps {
    isHost: boolean;
    selectedQuestion?: Question;
    setSelectedQuestion?: (selectedQuestion: Question) => void;
}

export const SelectedQuestionDisplay: React.FC<SelectedQuestionProps> = ({isHost, selectedQuestion}) => {
    const { 
        questions
    } = useQuestions();

    const selectedQuestionId = localStorage.getItem("selected_question_id");
    const selQues = questions.find((q => q.id === selectedQuestionId));
    const [question, setQuestion] = useState(isHost ? selectedQuestion : selQues);
    
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
          if (event.storageArea === localStorage && event.key === "selected_question_id" && !isHost) {
            try {
              if (event.newValue) {
                const selectedQuestionId = localStorage.getItem("selected_question_id");
                const selectedQues = questions.find((q => q.id === selectedQuestionId));
                setQuestion(selectedQues);
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

      useEffect(() => {
        // update changed selected question
        if (isHost) {
            setQuestion(selectedQuestion);
        }
      }, [selectedQuestion]);
    
    if (!question) {
        return (
            <div className="flex items-center align-center justify-center h-full bg-gray-800 rounded-lg p-4">
                <p className="text-gray-400">Select a question to display</p>
            </div>
        );
    }

    return (
        <Card className="h-full bg-gray-800 p-6">
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-blue-600 px-4 py-2 rounded-lg">
                        <span className="text-2xl font-bold">{question.votes}</span>
                        <span className="text-sm ml-1">votes</span>
                    </div>
                </div>
                <p className="text-xl font-semibold flex-1 text-white">{question.text}</p>
                <div className="mt-4">
                    <p className="text-sm text-gray-400 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {new Date(question.timestamp).toLocaleTimeString()}
                    </p>
                </div>
            </div>
        </Card>
    );
};

const InteractiveQAComponent: React.FC<InteractiveQAProps> = ({roomId}) => {
    const { 
        questions, 
        moderatedQuestions,
        handleVote, 
        handleSelectQuestion, 
        deleteQuestion,
        approveQuestion,
        addQuestion
    } = useQuestions();

    const selectedQuestionId = localStorage.getItem("selected_question_id");
    const savedSelectedQuestion = questions.find((q => q.id === selectedQuestionId));
    const [selectedQuestion, setSelectedQuestion] = useState(savedSelectedQuestion);
    useEffect(() => {
        const cleanupWebSocket = InteractiveQAConnection({
          roomID: roomId ?? "",
          onReceived: (action: InteractiveQAAction) => {
            console.log("Received Action:", action);
            if (action.TYPE === "send_question_to_host" && action.QUESTION) {
                addQuestion(JSON.parse(action.QUESTION));
                console.log("interactive received", action);
            }
          }
        });
        return cleanupWebSocket;
      }, [roomId]);

    useEffect(() => {
        // update changed selected question
        const ques = questions.find(q => q.isSelected);
        console.log("new sel ques", ques);
        setSelectedQuestion(ques);
      }, [questions]);

    
    function selectQuestion(question: Question) {
        handleSelectQuestion(question);
        sendInteractiveQAAction({
            SESSION_ID: roomId ?? "",
            TYPE: "select_interactive_question",
            QUESTION: JSON.stringify(question)
        });
        localStorage.setItem("selected_question_id" , question.id);
    }

    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="flex flex-1 gap-4 mt-8">
                {/* Left side - Selected Question and Review Section */}
                <div className="w-1/2 flex flex-col gap-4">
                    {/* Selected Question */}
                    <div className="flex-1">
                        <SelectedQuestionDisplay isHost selectedQuestion={selectedQuestion}/>
                    </div>

                    {/* Review Section */}
                    {moderatedQuestions.length > 0 && (
                        <div className="h-1/3 min-h-[200px]">
                            <h2 className="text-xl font-semibold mb-3 text-yellow-400">
                                Questions Requiring Review
                            </h2>
                            <ScrollArea className="h-[calc(100%-2rem)] bg-gray-800 rounded-lg p-4">
                                <div className="space-y-3">
                                    {moderatedQuestions.map((question) => (
                                        <Card
                                            key={question.id}
                                            className="p-4 bg-gray-700 border-l-4 border-yellow-400"
                                        >
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <p className="text-md text-white">{question.text}</p>
                                                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(question.timestamp).toLocaleTimeString()}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => approveQuestion(question.id)}
                                                        className="bg-green-600 hover:bg-green-700 p-2"
                                                    >
                                                        <CheckCircle className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteQuestion(question.id)}
                                                        className="bg-red-600 hover:bg-red-700 p-2"
                                                    >
                                                        <XCircle className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                    )}
                </div>

                {/* Right side - Question List */}
                <div className="w-1/2">
                    <ScrollArea className="h-full">
                        <div className="space-y-3">
                            {questions.map((question: Question) => (
                                <Card
                                    key={question.id}
                                    className={`p-4 transition-all duration-200 cursor-pointer ${
                                        question.isSelected 
                                            ? 'bg-blue-600 hover:bg-blue-700' 
                                            : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                    onClick={() => selectQuestion(question)}
                                >
                                    <div className="flex gap-4">
                                        <button
                                            className={`flex flex-col items-center min-w-[60px] p-2 rounded text-white ${
                                                question.hasVoted ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleVote(question.id);
                                            }}
                                        >
                                            <ChevronUp className="h-5 w-5 text-white"/>
                                            <span className="text-sm font-semibold text-white">{question.votes}</span>
                                        </button>
                                        <div className="flex-1">
                                            <p className="text-md text-white">{question.text}</p>
                                            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(question.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <button
                                            className="p-2 rounded bg-red-600 hover:bg-red-700 transition-colors duration-200"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteQuestion(question.id);
                                            }}
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};

export default InteractiveQAComponent;
