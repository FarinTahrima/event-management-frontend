import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components//ui/button";

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  color: string;
}

interface Block {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  isPowerUp: boolean;
}

const Pong: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ player1: 0, player2: 0 });
  const [paddle1, setPaddle1] = useState({ y: 150, dy: 0, height: 100 });
  const [paddle2, setPaddle2] = useState({ y: 150, dy: 0, height: 100 });
  const [ball, setBall] = useState<Ball | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [winner, setWinner] = useState<string | null>(null);

  const [keys, setKeys] = useState({
    w: false,
    s: false,
    ArrowUp: false,
    ArrowDown: false,
  });

  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
  }, [gameStarted]);

  const initializeGame = () => {
    setBall(createNewBall());
    setWinner(null);
    createBlocks();
  };

  const getRandomColor = () => {
    const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6', '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createNewBall = (): Ball => ({
    x: 300,
    y: 200,
    dx: Math.random() > 0.5 ? 5 : -5,
    dy: Math.random() > 0.5 ? 5 : -5,
    radius: 5,
    color: getRandomColor(),
  });

  const createBlocks = () => {
    const newBlocks: Block[] = [];
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 8; j++) {
        newBlocks.push({
          x: 250 + i * 20,
          y: 50 + j * 40,
          width: 15,
          height: 30,
          color: getRandomColor(),
          isPowerUp: Math.random() < 0.2, 
        });
      }
    }
    setBlocks(newBlocks);
  };

  useEffect(() => {
    if (!gameStarted || !ball) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const gameLoop = setInterval(() => {
      if (gameOver) return;

      context.clearRect(0, 0, canvas.width, canvas.height);

      setPaddle1(prev => ({
        ...prev,
        dy: keys.w ? -5 : keys.s ? 5 : 0,
        y: Math.max(0, Math.min(prev.y + (keys.w ? -5 : keys.s ? 5 : 0), canvas.height - prev.height))
      }));
      setPaddle2(prev => ({
        ...prev,
        dy: keys.ArrowUp ? -5 : keys.ArrowDown ? 5 : 0,
        y: Math.max(0, Math.min(prev.y + (keys.ArrowUp ? -5 : keys.ArrowDown ? 5 : 0), canvas.height - prev.height))
      }));

      context.fillStyle = 'white';
      context.fillRect(10, paddle1.y, 10, paddle1.height);
      context.fillRect(580, paddle2.y, 10, paddle2.height);

      context.font = '14px Arial';
      context.fillText('W/S', 15, 20);
      context.fillText('↑/↓', 565, 20);

      setBall(prevBall => {
        if (!prevBall) return null;
        const newBall = { ...prevBall };

        if (newBall.y - newBall.radius <= 0 || newBall.y + newBall.radius >= canvas.height) {
          newBall.dy = -newBall.dy;
        }

        if (newBall.x - newBall.radius <= 20 && newBall.y > paddle1.y && newBall.y < paddle1.y + paddle1.height) {
          newBall.dx = Math.abs(newBall.dx);
          newBall.x = 20 + newBall.radius;
          newBall.dy += paddle1.dy * 0.2;
        } else if (newBall.x + newBall.radius >= 570 && newBall.y > paddle2.y && newBall.y < paddle2.y + paddle2.height) {
          newBall.dx = -Math.abs(newBall.dx);
          newBall.x = 570 - newBall.radius;
          newBall.dy += paddle2.dy * 0.2;
        }

        setBlocks(prevBlocks => {
          let updatedBlocks = [...prevBlocks];
          for (let i = 0; i < updatedBlocks.length; i++) {
            const block = updatedBlocks[i];
            if (
              newBall.x + newBall.radius > block.x &&
              newBall.x - newBall.radius < block.x + block.width &&
              newBall.y + newBall.radius > block.y &&
              newBall.y - newBall.radius < block.y + block.height
            ) {
              const overlapLeft = newBall.x + newBall.radius - block.x;
              const overlapRight = block.x + block.width - (newBall.x - newBall.radius);
              const overlapTop = newBall.y + newBall.radius - block.y;
              const overlapBottom = block.y + block.height - (newBall.y - newBall.radius);

              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

              if (minOverlap === overlapLeft || minOverlap === overlapRight) {
                newBall.dx = -newBall.dx;
              } else {
                newBall.dy = -newBall.dy;
              }

              if (block.isPowerUp) {
                // Speed up the ball
                newBall.dx *= 1.2;
                newBall.dy *= 1.2;
              } else {
                // Slow down the ball
                newBall.dx *= 1.0;
                newBall.dy *= 1.0;
              }

              updatedBlocks = updatedBlocks.filter((_, index) => index !== i);
              break;
            }
          }
          return updatedBlocks;
        });

        newBall.x += newBall.dx;
        newBall.y += newBall.dy;

        context.fillStyle = newBall.color;
        context.beginPath();
        context.arc(newBall.x, newBall.y, newBall.radius, 0, Math.PI * 2);
        context.fill();

        return newBall;
      });

      blocks.forEach(block => {
        context.fillStyle = block.isPowerUp ? '#FFD700' : block.color; // Gold color for power-up blocks
        context.fillRect(block.x, block.y, block.width, block.height);
      });

      if (ball) {
        if (ball.x <= 0) {
          setScore(prev => {
            const newScore = { ...prev, player2: prev.player2 + 1 };
            checkWinner(newScore);
            return newScore;
          });
          resetBall();
        } else if (ball.x >= canvas.width) {
          setScore(prev => {
            const newScore = { ...prev, player1: prev.player1 + 1 };
            checkWinner(newScore);
            return newScore;
          });
          resetBall();
        }
      }

      // Draw scoreboard
      context.fillStyle = 'white';
      context.font = '24px Arial';
      context.textAlign = 'center';
      context.fillText(`${score.player1} - ${score.player2}`, canvas.width / 2, 30);

    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, paddle1, paddle2, ball, blocks, score, keys]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        e.preventDefault();
        setKeys(prev => ({ ...prev, [e.key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'w', 's'].includes(e.key)) {
        setKeys(prev => ({ ...prev, [e.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetBall = () => {
    setBall(createNewBall());
  };

  const checkWinner = (newScore: { player1: number; player2: number }) => {
    if (newScore.player1 >= 7) {
      setWinner('Player 1');
      setGameOver(true);
    } else if (newScore.player2 >= 7) {
      setWinner('Player 2');
      setGameOver(true);
    }
  };

  const resetGame = () => {
    setGameOver(false);
    setScore({ player1: 0, player2: 0 });
    setPaddle1({ y: 150, dy: 0, height: 100 });
    setPaddle2({ y: 150, dy: 0, height: 100 });
    initializeGame();
    setKeys({ w: false, s: false, ArrowUp: false, ArrowDown: false });
    setWinner(null);
  };

  const startGame = () => {
    setGameStarted(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <canvas ref={canvasRef} width={600} height={400} className="border border-white" />
      <div className="mt-4 text-center">
        <p className="font-bold text-xl mb-2">Instructions:</p>
        <p>Player 1 (Left): W (up) / S (down)</p>
        <p>Player 2 (Right): ↑ (up) / ↓ (down)</p>
        <p>First to 7 points wins!</p>
        <p>Gold blocks are power-ups that speed up the ball!</p>
        <p>Regular blocks maintain the ball's speed.</p>
      </div>
      {winner && (
        <div className="mt-4 text-2xl font-bold">
          {winner} wins!
        </div>
      )}
      {!gameStarted ? (
        <Button 
          className="mt-4 text-white bg-green-600 hover:bg-green-700"
          onClick={startGame}
        >
          Start Game
        </Button>
      ) : (
        <Button 
          className="mt-4 text-white bg-blue-600 hover:bg-blue-700"
          onClick={resetGame}
        >
          Reset Game
        </Button>
      )}
    </div>
  );
};

export default Pong;