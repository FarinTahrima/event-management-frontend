import React, { createContext, useState, useContext, useEffect } from 'react';

export interface Question {
  id: string;
  text: string;
  votes: number;
  hasVoted: boolean;
  isSelected: boolean;
  timestamp: Date;
  moderationStatus: 'approved' | 'flagged' | 'pending';
}

interface QuestionContextType {
    questions: Question[];
    moderatedQuestions: Question[];
    setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
    handleVote: (questionId: string) => void;
    handleSelectQuestion: (question: Question) => void;
    addQuestion: (text: string) => Promise<void>;
    deleteQuestion: (questionId: string) => void;
    approveQuestion: (questionId: string) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestions = () => {
    const context = useContext(QuestionContext);
    if (!context) {
        throw new Error('useQuestions must be used within a QuestionProvider');
    }
    return context;
};

export const QuestionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [questions, setQuestions] = useState<Question[]>(() => {
        const savedQuestions = localStorage.getItem('questions');
        if (savedQuestions) {
            const parsed = JSON.parse(savedQuestions);
            return parsed.map((q: any) => ({
                ...q,
                timestamp: new Date(q.timestamp),
                moderationStatus: q.moderationStatus || 'approved'
            }));
        }
        return [];
    });

    const [moderatedQuestions, setModeratedQuestions] = useState<Question[]>(() => {
        const savedModerated = localStorage.getItem('moderatedQuestions');
        return savedModerated ? JSON.parse(savedModerated).map((q: any) => ({
            ...q,
            timestamp: new Date(q.timestamp)
        })) : [];
    });

    useEffect(() => {
        localStorage.setItem('questions', JSON.stringify(questions));
        localStorage.setItem('moderatedQuestions', JSON.stringify(moderatedQuestions));
    }, [questions, moderatedQuestions]);

    const handleVote = (questionId: string) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(question =>
                question.id === questionId
                    ? {
                        ...question,
                        votes: question.hasVoted ? question.votes - 1 : question.votes + 1,
                        hasVoted: !question.hasVoted
                    }
                    : question
            )
        );
    };

    const handleSelectQuestion = (selectedQuestion: Question) => {
        setQuestions(prevQuestions =>
            prevQuestions.map(question => ({
                ...question,
                isSelected: question.id === selectedQuestion.id
            }))
        );
    };

    const addQuestion = async (text: string) => {
        try {
            const response = await fetch('http://localhost:3000/moderate-question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            const { status } = await response.json();

            const newQuestion: Question = {
                id: Date.now().toString(),
                text,
                votes: 0,
                hasVoted: false,
                isSelected: false,
                timestamp: new Date(),
                moderationStatus: status
            };

            if (status === 'approved') {
                setQuestions(prev => [...prev, newQuestion]);
            } else {
                setModeratedQuestions(prev => [...prev, newQuestion]);
            }
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    const deleteQuestion = (questionId: string) => {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        setModeratedQuestions(prev => prev.filter(q => q.id !== questionId));
    };

    const approveQuestion = (questionId: string) => {
        const questionToApprove = moderatedQuestions.find(q => q.id === questionId);
        if (questionToApprove) {
            setQuestions(prev => [...prev, { ...questionToApprove, moderationStatus: 'approved' }]);
            setModeratedQuestions(prev => prev.filter(q => q.id !== questionId));
        }
    };

    return (
        <QuestionContext.Provider
            value={{
                questions,
                moderatedQuestions,
                setQuestions,
                handleVote,
                handleSelectQuestion,
                addQuestion,
                deleteQuestion,
                approveQuestion
            }}
        >
            {children}
        </QuestionContext.Provider>
    );
};

export default QuestionProvider;
