import React from 'react';
import { useQuestions } from '../../contexts/QuestionContext';
import { Card } from "@/components/shadcn/ui/card";
import { Clock } from "lucide-react";

const SelectedQuestion: React.FC = () => {
  const { questions } = useQuestions();
  const selectedQuestion = questions.find(q => q.isSelected);

  if (!selectedQuestion) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">No question selected</p>
      </div>
    );
  }

  return (
    <Card className="h-full bg-gray-800 p-6">
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-blue-600 px-4 py-2 rounded-lg">
            <span className="text-2xl font-bold">{selectedQuestion.votes}</span>
            <span className="text-sm ml-1">votes</span>
          </div>
        </div>
        <p className="text-xl font-semibold flex-1 text-white">{selectedQuestion.text}</p>
        <div className="mt-4">
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {new Date(selectedQuestion.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default SelectedQuestion;