import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Calendar } from 'lucide-react';

interface WaitingRoomProps {
  eventStartTime: string; // ISO string format
  eventName: string;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ eventStartTime, eventName }) => {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  // Format the event date and time for display
  const eventDate = new Date(eventStartTime);
  const formattedDate = eventDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = eventDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const startTime = new Date(eventStartTime).getTime();
      const distance = startTime - now;

      if (distance < 0) {
        clearInterval(timer);
        // Handle event start
        return;
      }

      setTimeRemaining({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [eventStartTime]);

  const EventInfoCard = () => (
    <Card className="bg-gray-900 p-6 mb-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">{eventName}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Event Date/Time Info */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-blue-400" />
              <span className="text-lg font-semibold">Event Date & Time</span>
            </div>
            <div className="ml-7">
              <p className="text-lg">{formattedDate}</p>
              <p className="text-lg">{formattedTime}</p>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-green-400" />
              <span className="text-lg font-semibold">Time Remaining</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xl font-mono">{String(timeRemaining.days).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">DAYS</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xl font-mono">{String(timeRemaining.hours).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">HOURS</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xl font-mono">{String(timeRemaining.minutes).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">MINS</div>
              </div>
              <div className="bg-gray-700 rounded p-2">
                <div className="text-xl font-mono">{String(timeRemaining.seconds).padStart(2, '0')}</div>
                <div className="text-xs text-gray-400">SECS</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  const TicTacToe = () => {
    // Simple TicTacToe implementation
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isXNext, setIsXNext] = useState(true);

    const handleClick = (index: number) => {
      if (board[index] || calculateWinner(board)) return;
      
      const newBoard = board.slice();
      newBoard[index] = isXNext ? 'X' : 'O';
      setBoard(newBoard);
      setIsXNext(!isXNext);
    };

    const calculateWinner = (squares: Array<string | null>) => {
      const lines = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
      ];

      for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
          return squares[a];
        }
      }
      return null;
    };

    const winner = calculateWinner(board);
    const status = winner 
      ? `Winner: ${winner}`
      : `Next player: ${isXNext ? 'X' : 'O'}`;

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold">{status}</div>
        <div className="grid grid-cols-3 gap-2">
          {board.map((square, index) => (
            <button
              key={index}
              className="w-16 h-16 bg-white text-black text-2xl font-bold border border-gray-300 rounded"
              onClick={() => handleClick(index)}
            >
              {square}
            </button>
          ))}
        </div>
        <Button 
          onClick={() => setBoard(Array(9).fill(null))}
          variant="secondary"
        >
          Reset Game
        </Button>
      </div>
    );
  };

  const MusicPlayer = () => {
    // Simple music player implementation
    const playlist = [
      { title: "Lofi Beat 1", url: "/music/lofi1.mp3" },
      { title: "Ambient Music", url: "/music/ambient1.mp3" },
      { title: "Chill Wave", url: "/music/chill1.mp3" },
    ];

    const [currentTrack, setCurrentTrack] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-lg font-semibold">Music Player</div>
        <div className="w-full max-w-md bg-gray-800 rounded-lg p-4">
          <div className="text-center mb-4">
            Now Playing: {playlist[currentTrack].title}
          </div>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => setCurrentTrack(prev => 
                prev === 0 ? playlist.length - 1 : prev - 1
              )}
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              variant="secondary"
            >
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button
              onClick={() => setCurrentTrack(prev => 
                prev === playlist.length - 1 ? 0 : prev + 1
              )}
              variant="secondary"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#08081d] text-white p-8">
      <div className="max-w-4xl mx-auto">
        <EventInfoCard />

        <Tabs defaultValue="games" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="music">Music</TabsTrigger>
          </TabsList>
          <TabsContent value="games" className="mt-6">
            <Card className="bg-gray-900 p-6">
              <TicTacToe />
            </Card>
          </TabsContent>
          <TabsContent value="music" className="mt-6">
            <Card className="bg-gray-900 p-6">
              <MusicPlayer />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WaitingRoom;