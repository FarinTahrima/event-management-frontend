import React, { useState, useEffect } from 'react';
import { Button } from "@/components//ui/button";
import { useAppContext } from "@/contexts/AppContext";
import { User } from "@/utils/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components//ui/dialog";
import { Input } from "@/components//ui/input";
import { toast } from "@/components//ui/use-toast";
import { useNavigate } from 'react-router-dom';

const WordleLoginButton: React.FC = () => {
  const { setIsLoggedIn, setUser } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [word, setWord] = useState('');
  const [hint, setHint] = useState('');
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const fakeUsers: User[] = [
    { id: 9999, username: "maylwin.dev", email: "watergirl@example.com" },
    { id: 9998, username: "handythong.dev", email: "phantasm.wing@example.com" },
    { id: 9997, username: "max.dev", email: "arckey@example.com" },
    { id: 9996, username: "timothy.dev", email: "geishaboi@example.com" },
  ];

  const words = [
    { word: 'array', hint: 'A data structure that stores multiple elements of the same type in a contiguous block of memory' },
    { word: 'props', hint: 'Short for properties, used to pass data from parent to child components in React' },
    { word: 'state', hint: 'An object that holds data that may change over time in a component' },
    { word: 'class', hint: 'A blueprint for creating objects in object-oriented programming' },
    { word: 'loops', hint: 'Structures that allow you to repeat a block of code multiple times' },
    { word: 'debug', hint: 'The process of finding and fixing errors in your code' },
    { word: 'scope', hint: 'Defines the visibility and accessibility of variables in your code' },
    { word: 'event', hint: 'An action or occurrence detected by a program, often used in user interfaces' },
    { word: 'const', hint: 'A keyword used to declare variables whose values cannot be changed after initialization' },
    { word: 'fetch', hint: 'A method used to request and retrieve data from a server or API' },
  ];

  function pickRandomUser(): User {
    return fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
  }

  const startGame = () => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    setWord(randomWord.word);
    setHint(randomWord.hint);
    setGuesses([]);
    setCurrentGuess('');
    setIsOpen(true);
  };

  const handleGuess = () => {
    if (currentGuess.length !== 5) {
      toast({ title: "Error", description: "Guess must be 5 letters long", variant: "destructive" });
      return;
    }

    const newGuesses = [...guesses, currentGuess.toLowerCase()];
    setGuesses(newGuesses);
    setCurrentGuess('');

    if (currentGuess.toLowerCase() === word) {
      setShowSuccessDialog(true);
    } else if (newGuesses.length >= 5) {
      toast({ title: "Game Over", description: `The word was: ${word}`, variant: "destructive" });
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (showSuccessDialog) {
      const timer = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount <= 1) {
            clearInterval(timer);
            const randomUser = pickRandomUser();
            setUser({
              id: randomUser.id,
              username: randomUser.username,
            });
            setIsLoggedIn(true);
            setShowSuccessDialog(false);
            setIsOpen(false);
            navigate('/');  
            return 3;
          }
          return prevCount - 1;
        });
      }, 1000);
  
      return () => clearInterval(timer);
    }
  }, [showSuccessDialog, setUser, setIsLoggedIn, navigate]);  
  

  const renderLetterBox = (letter: string, index: number, word: string) => {
    let bgColor = 'bg-gray-300';
    if (letter === word[index]) {
      bgColor = 'bg-green-500';
    } else if (word.includes(letter)) {
      bgColor = 'bg-yellow-500';
    }
    return (
      <div
        key={index}
        className={`w-10 h-10 flex items-center justify-center border border-black ${bgColor} text-black`}
      >
        {letter}
      </div>
    );
  };

  return (
    <>
      <button
        onClick={startGame}
        className="font-alatsi text-base text-blue-500 hover:text-blue-700 underline focus:outline-none"
      >
        Forgot Password?
      </button>
      <Dialog open={isOpen || showSuccessDialog} onClose={() => setIsOpen(false)}>
        <DialogContent>
          <div className="sm:max-w-md mx-auto">
            <DialogHeader>
              <DialogTitle className="text-black">
                {showSuccessDialog ? "Success!" : "Wordle Password Recovery"}
              </DialogTitle>
            </DialogHeader>
            {showSuccessDialog ? (
              <div className="space-y-4 text-black">
                <p>Congratulations! You've guessed the word correctly.</p>
                <p>The word was: <strong>{word}</strong></p>
                <p>Redirecting in {countdown} seconds...</p>
              </div>
            ) : (
              <div className="space-y-4 text-black">
                <p>Guess the 5-letter word to log in. You have 5 guesses.</p>
                <p><strong>Hint:</strong> {hint}</p>
                <p>Guesses left: {5 - guesses.length}</p>
                {guesses.map((guess, index) => (
                  <div key={index} className="flex space-x-1">
                    {guess.split('').map((letter, i) => renderLetterBox(letter, i, word))}
                  </div>
                ))}
                <div className="flex space-x-1">
                  {currentGuess.split('').concat(Array(5 - currentGuess.length).fill('')).map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 flex items-center justify-center border border-black bg-white text-black"
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <Input
                    value={currentGuess}
                    onChange={(e: { target: { value: string; }; }) => setCurrentGuess(e.target.value.toLowerCase())}
                    maxLength={5}
                    placeholder="Enter your guess"
                    className="text-black"
                  />
                  <Button onClick={handleGuess} disabled={currentGuess.length !== 5}>
                    Guess
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WordleLoginButton;