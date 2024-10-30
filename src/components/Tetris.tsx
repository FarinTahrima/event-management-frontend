import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components//ui/button";

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
      className="flex flex-col items-center justify-center min-h-screen bg-gray-100"
      onKeyDown={handleKeyPress}
    >
      <div className="mb-4 text-2xl font-bold">Score: {score}</div>
      <div className="grid grid-cols-10 gap-px bg-gray-300 p-1">
        {board.map((row, y) =>
          row.map((cell, x) => (
            <div
              key={`${y}-${x}`}
              className={`w-6 h-6 ${
                cell || (currentPiece[y - position.y]?.[x - position.x])
                  ? 'bg-blue-500'
                  : 'bg-white'
              }`}
            />
          ))
        )}
      </div>
      {gameOver && (
        <div className="mt-4 text-xl font-bold text-red-500">Game Over!</div>
      )}
      <Button onClick={resetGame} className="mt-4">
        {gameOver ? 'Play Again' : 'Reset Game'}
      </Button>
    </div>
  );
};

export default TetrisGame;