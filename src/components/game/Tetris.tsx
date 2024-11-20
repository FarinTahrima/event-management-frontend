import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/shadcn/ui/button";

const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const TICK_SPEED = 1000;

type Piece = number[][];
type Position = { x: number; y: number };

const TETROMINOS: Piece[] = [
  [[1, 1, 1, 1]],
  [[1, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
  [[1, 1, 0], [0, 1, 1]],
  [[0, 1, 1], [1, 1, 0]]
];

const createBoard = () => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));

const TetrisGame: React.FC = () => {
  const [board, setBoard] = useState(createBoard());
  const [currentPiece, setCurrentPiece] = useState<Piece>([]);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const gameContainerRef = useRef<HTMLDivElement>(null);

  const spawnPiece = useCallback(() => {
    const piece = TETROMINOS[Math.floor(Math.random() * TETROMINOS.length)];
    setCurrentPiece(piece);
    setPosition({ x: Math.floor(BOARD_WIDTH / 2) - Math.floor(piece[0].length / 2), y: 0 });
  }, []);

  const isValidMove = (piece: Piece, pos: Position) => {
    for (let y = 0; y < piece.length; y++) {
      for (let x = 0; x < piece[y].length; x++) {
        if (piece[y][x]) {
          const newX = pos.x + x;
          const newY = pos.y + y;
          if (newX < 0 || newX >= BOARD_WIDTH || newY >= BOARD_HEIGHT || (newY >= 0 && board[newY][newX])) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const rotatePiece = () => {
    const rotated = currentPiece[0].map((_, index) =>
      currentPiece.map(row => row[index]).reverse()
    );
    if (isValidMove(rotated, position)) {
      setCurrentPiece(rotated);
    }
  };

  const movePiece = (dx: number, dy: number) => {
    const newPos = { x: position.x + dx, y: position.y + dy };
    if (isValidMove(currentPiece, newPos)) {
      setPosition(newPos);
    }
  };

  const mergePieceToBoard = () => {
    const newBoard = board.map(row => [...row]);
    for (let y = 0; y < currentPiece.length; y++) {
      for (let x = 0; x < currentPiece[y].length; x++) {
        if (currentPiece[y][x]) {
          newBoard[position.y + y][position.x + x] = 1;
        }
      }
    }
    return newBoard;
  };

  const checkLines = (board: number[][]) => {
    let lines = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell === 1)) {
        lines++;
        return false;
      }
      return true;
    });
    while (newBoard.length < BOARD_HEIGHT) {
      newBoard.unshift(Array(BOARD_WIDTH).fill(0));
    }
    setScore(prevScore => prevScore + lines * 100);
    return newBoard;
  };

  const gameLoop = useCallback(() => {
    if (!isValidMove(currentPiece, { x: position.x, y: position.y + 1 })) {
      const newBoard = mergePieceToBoard();
      const clearedBoard = checkLines(newBoard);
      setBoard(clearedBoard);
      spawnPiece();
      if (!isValidMove(currentPiece, { x: BOARD_WIDTH / 2 - 1, y: 0 })) {
        setGameOver(true);
      }
    } else {
      setPosition(prev => ({ ...prev, y: prev.y + 1 }));
    }
  }, [currentPiece, position, board, spawnPiece]);

  useEffect(() => {
    if (!gameOver) {
      const timer = setInterval(gameLoop, TICK_SPEED);
      return () => clearInterval(timer);
    }
  }, [gameLoop, gameOver]);

  useEffect(() => {
    spawnPiece();
  }, [spawnPiece]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (gameOver) return;
    
    // Prevent default behavior for arrow keys
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      case 'ArrowLeft':
        movePiece(-1, 0);
        break;
      case 'ArrowRight':
        movePiece(1, 0);
        break;
      case 'ArrowDown':
        movePiece(0, 1);
        break;
      case 'ArrowUp':
        rotatePiece();
        break;
    }
  }, [gameOver, movePiece, rotatePiece]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, []);

  useEffect(() => {
    if (gameContainerRef.current) {
      gameContainerRef.current.focus();
    }
  }, []);

  const resetGame = () => {
    setBoard(createBoard());
    setGameOver(false);
    setScore(0);
    spawnPiece();
  };

  return (
    <div 
      ref={gameContainerRef}
      tabIndex={0}
      className="min-h-screen bg-gradient-to-b from-navy-800 to-navy-900 py-8 font-mono"
      onKeyDown={handleKeyPress}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-300 mb-4 tracking-wider border-b-4 border-yellow-300 pb-2 inline-block">
            🎮 TETRIS 🎮
          </h1>
          <div className="text-lg text-yellow-300 border-2 border-yellow-300 px-4 py-2 inline-block">
            SCORE: {score}
          </div>
        </div>

        {/* Game Board */}
        <div className="flex justify-center">
          <div className="game-board-container">
            <div className="grid gap-0 bg-navy-700 p-4 rounded-lg shadow-neon">
              {/* Game Grid */}
              <div className="grid grid-cols-10 gap-px">
                {board.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`${y}-${x}`}
                      className={`
                        w-6 h-6 border
                        ${cell || (currentPiece[y - position.y]?.[x - position.x])
                          ? 'bg-green-400 border-green-300 shadow-neon-cell'
                          : 'bg-navy-800 border-green-400/20'}
                        transition-all duration-150
                      `}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Controls Info */}
        <div className="mt-8 text-center text-green-400">
          <p className="mb-2">CONTROLS</p>
          <div className="flex justify-center gap-4">
            <span>⬅️ Move Left</span>
            <span>➡️ Move Right</span>
            <span>⬇️ Move Down</span>
            <span>⬆️ Rotate</span>
          </div>
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 bg-navy-900/90 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-navy-800 p-8 rounded-lg shadow-neon border-2 border-yellow-300 text-center">
              <h2 className="text-2xl font-bold mb-4 text-yellow-300">GAME OVER</h2>
              <p className="text-xl mb-4 text-green-400">Final Score: {score}</p>
              <Button
                onClick={resetGame}
                className="bg-yellow-300 text-navy-900 px-6 py-2 rounded hover:bg-yellow-400 
                         transition-all duration-200 font-bold tracking-wider"
              >
                PLAY AGAIN
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TetrisGame;