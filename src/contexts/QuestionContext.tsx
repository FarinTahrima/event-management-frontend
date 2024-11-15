import React, { createContext, useState, useContext, useEffect } from 'react';
import { Question } from '../types/types';

interface QuestionContextType {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  handleVote: (questionId: string) => void;
  handleSelectQuestion: (question: Question) => void;
  addQuestion: (text: string) => void;
  deleteQuestion: (questionId: string) => void; 
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<Question[]>(() => {
    const savedQuestions = localStorage.getItem('questions');
    if (savedQuestions) {
      const parsed = JSON.parse(savedQuestions);
      return parsed.map((q: any) => ({
        ...q,
        timestamp: new Date(q.timestamp)
      }));
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('questions', JSON.stringify(questions));
  }, [questions]);

  const handleVote = (questionId: string) => {
    setQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? {
              ...q,
              votes: q.hasVoted ? q.votes - 1 : q.votes + 1,
              hasVoted: !q.hasVoted,
            }
          : q
      )
    );
  };

  const handleSelectQuestion = (question: Question) => {
    setQuestions(prev =>
      prev.map(q => ({
        ...q,
        isSelected: q.id === question.id ? !q.isSelected : false,
      }))
    );
  };

  const addQuestion = (text: string) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text,
      votes: 0,
      hasVoted: false,
      isSelected: false,
      timestamp: new Date(),
    };
    setQuestions(prev => [...prev, newQuestion]);
  };

  const deleteQuestion = (questionId: string) => {
    setQuestions(prev => prev.filter(q => q.id !== questionId));
  };

  return (
    <QuestionContext.Provider 
      value={{ 
        questions, 
        setQuestions, 
        handleVote, 
        handleSelectQuestion,
        addQuestion,
        deleteQuestion 
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (context === undefined) {
    throw new Error('useQuestions must be used within a QuestionProvider');
  }
  return context;
};