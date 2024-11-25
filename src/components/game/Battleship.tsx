import React, { useState, useEffect } from 'react';

interface Ship {
    name: string;
    size: number;
    position?: { row: number; col: number };
    horizontal?: boolean;
}

interface AIShip {
    position: { row: number; col: number };
    horizontal: boolean;
    size: number;
}

interface ProbabilityCell {
    row: number;
    col: number;
    weight: number;
}

interface GameState {
    playerBoard: (string | null)[][];
    aiBoard: {
        tried: boolean;
        hit: boolean;
    }[][];
    aiShips: AIShip[];
    playerHits: boolean[][];
    gameStatus: 'setup' | 'playing' | 'finished';
    currentShip: Ship | null;
    placedShips: Ship[];
    message: string;
    isRotated: boolean;
    playerScore: number;
    aiScore: number;
    aiLastHit: { row: number; col: number } | null;
    aiHuntMode: boolean;
    aiCurrentDirection: Direction;
    aiMoveHistory: AIMoveHistory[];
    aiTargetStack: { row: number; col: number }[];
}

interface AIMoveHistory {
    row: number;
    col: number;
    hit: boolean;
}

interface HitStreak {
    hits: { row: number; col: number }[];
    direction: Direction;
}

type Direction = 'up' | 'right' | 'down' | 'left' | null;

const SHIPS: Ship[] = [
    { name: 'Carrier', size: 5 },
    { name: 'Battleship', size: 4 },
    { name: 'Cruiser', size: 3 },
    { name: 'Submarine', size: 3 },
    { name: 'Destroyer', size: 2 }
];

const HUNT_PATTERNS = [
    [0, 0], [0, 2], [0, 4], [0, 6], [0, 8],
    [1, 1], [1, 3], [1, 5], [1, 7], [1, 9],
    [2, 0], [2, 2], [2, 4], [2, 6], [2, 8],
    [3, 1], [3, 3], [3, 5], [3, 7], [3, 9],
    [4, 0], [4, 2], [4, 4], [4, 6], [4, 8],
    [5, 1], [5, 3], [5, 5], [5, 7], [5, 9],
    [6, 0], [6, 2], [6, 4], [6, 6], [6, 8],
    [7, 1], [7, 3], [7, 5], [7, 7], [7, 9],
    [8, 0], [8, 2], [8, 4], [8, 6], [8, 8],
    [9, 1], [9, 3], [9, 5], [9, 7], [9, 9]
];

const placeAIShips = (): AIShip[] => {
    const aiShips: AIShip[] = [];
    const board = Array(10).fill(null).map(() => Array(10).fill(null));

    const isValidAIPlacement = (row: number, col: number, size: number, horizontal: boolean): boolean => {
        if (horizontal) {
            if (col + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[row][col + i] !== null) return false;
            }
        } else {
            if (row + size > 10) return false;
            for (let i = 0; i < size; i++) {
                if (board[row + i][col] !== null) return false;
            }
        }
        return true;
    };

    SHIPS.forEach(ship => {
        let placed = false;
        while (!placed) {
            const row = Math.floor(Math.random() * 10);
            const col = Math.floor(Math.random() * 10);
            const horizontal = Math.random() > 0.5;

            if (isValidAIPlacement(row, col, ship.size, horizontal)) {
                for (let i = 0; i < ship.size; i++) {
                    if (horizontal) {
                        board[row][col + i] = ship.name;
                    } else {
                        board[row + i][col] = ship.name;
                    }
                }
                aiShips.push({ position: { row, col }, horizontal, size: ship.size });
                placed = true;
            }
        }
    });

    return aiShips;
};

const Battleship: React.FC = () => {
    const initialState: GameState = {
        playerBoard: Array(10).fill(null).map(() => Array(10).fill(null)),
        aiBoard: Array(10).fill(null).map(() => 
            Array(10).fill(null).map(() => ({ tried: false, hit: false }))
        ),
        aiShips: [],
        playerHits: Array(10).fill(null).map(() => Array(10).fill(false)),
        gameStatus: 'setup',
        currentShip: null,
        placedShips: [],
        message: 'Place your ships! Press R to rotate',
        isRotated: false,
        playerScore: 0,
        aiScore: 0,
        aiLastHit: null,
        aiHuntMode: false,
        aiCurrentDirection: null,
        aiMoveHistory: [],
        aiTargetStack: [],
    };

    const [gameState, setGameState] = useState<GameState>(initialState);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
    const [showGameOver, setShowGameOver] = useState(false);

    const startNewGame = () => {
        setGameState({
            ...initialState,
            aiShips: placeAIShips()
        });
        setShowGameOver(false);
    };

    const findShipOrientation = (state: GameState): { row: number; col: number } | null => {
        if (!state.aiLastHit) return null;
    
        const { row, col } = state.aiLastHit;
        const directions: [Direction, number, number][] = [
            ['up', -1, 0],
            ['right', 0, 1],
            ['down', 1, 0],
            ['left', 0, -1]
        ];

        for (const [dir, dx, dy] of directions) {
            const checkRow = row + dx;
            const checkCol = col + dy;
            
            if (checkRow >= 0 && checkRow < 10 && checkCol >= 0 && checkCol < 10) {
                const isAdjacentHit = state.aiMoveHistory.some(
                    move => move.hit && move.row === checkRow && move.col === checkCol
                );
                
                if (isAdjacentHit) {
                    const oppositeRow = row - dx;
                    const oppositeCol = col - dy;
                    if (isValidMove(oppositeRow, oppositeCol, state.playerHits)) {
                        return { row: oppositeRow, col: oppositeCol };
                    }
                    const nextRow = checkRow + dx;
                    const nextCol = checkCol + dy;
                    if (isValidMove(nextRow, nextCol, state.playerHits)) {
                        return { row: nextRow, col: nextCol };
                    }
                }
            }
        }

        for (const [_, dx, dy] of directions) {
            const newRow = row + dx;
            const newCol = col + dy;
            if (isValidMove(newRow, newCol, state.playerHits)) {
                return { row: newRow, col: newCol };
            }
        }
    
        return null;
    };    

    const getAIMove = (state: GameState): { row: number; col: number } => {
        const hitStreak = findHitStreak(state);
        
        if (hitStreak) {
            const nextMove = getNextMoveInStreak(state, hitStreak);
            if (nextMove) return nextMove;
        }

        if (state.aiHuntMode && state.aiLastHit) {
            const nextMove = findShipOrientation(state);
            if (nextMove) return nextMove;
        }
        return getProbabilityBasedMove(state);
    };

    const findHitStreak = (state: GameState): HitStreak | null => {
        const recentHits = state.aiMoveHistory
            .filter(move => move.hit)
            .slice(-5); 
    
        if (recentHits.length < 2) return null;

        const sortedByRow = [...recentHits].sort((a, b) => a.row - b.row || a.col - b.col);
        for (let i = 0; i < sortedByRow.length - 1; i++) {
            if (sortedByRow[i].row === sortedByRow[i + 1].row && 
                Math.abs(sortedByRow[i].col - sortedByRow[i + 1].col) === 1) {
                return {
                    hits: [sortedByRow[i], sortedByRow[i + 1]],
                    direction: sortedByRow[i].col < sortedByRow[i + 1].col ? 'right' : 'left'
                };
            }
        }

        const sortedByCol = [...recentHits].sort((a, b) => a.col - b.col || a.row - b.row);
        for (let i = 0; i < sortedByCol.length - 1; i++) {
            if (sortedByCol[i].col === sortedByCol[i + 1].col && 
                Math.abs(sortedByCol[i].row - sortedByCol[i + 1].row) === 1) {
                return {
                    hits: [sortedByCol[i], sortedByCol[i + 1]],
                    direction: sortedByCol[i].row < sortedByCol[i + 1].row ? 'down' : 'up'
                };
            }
        }
    
        return null;
    };

    const getNextMoveInStreak = (state: GameState, streak: HitStreak): { row: number; col: number } | null => {
        const { hits, direction } = streak;
        const lastHit = hits[hits.length - 1];

        let nextRow = lastHit.row;
        let nextCol = lastHit.col;
        
        switch (direction) {
            case 'right': nextCol++; break;
            case 'left': nextCol--; break;
            case 'down': nextRow++; break;
            case 'up': nextRow--; break;
        }
    
        if (isValidMove(nextRow, nextCol, state.playerHits)) {
            return { row: nextRow, col: nextCol };
        }

        const firstHit = hits[0];
        nextRow = firstHit.row;
        nextCol = firstHit.col;
        
        switch (direction) {
            case 'right': nextCol--; break;
            case 'left': nextCol++; break;
            case 'down': nextRow--; break;
            case 'up': nextRow++; break;
        }
    
        if (isValidMove(nextRow, nextCol, state.playerHits)) {
            return { row: nextRow, col: nextCol };
        }
    
        return null;
    };
    
    const getProbabilityBasedMove = (state: GameState): { row: number; col: number } => {
        const cells: ProbabilityCell[] = [];
        const heatMap = Array(10).fill(0).map(() => Array(10).fill(0));

        if (!state.aiHuntMode) {
            HUNT_PATTERNS.forEach(([row, col]) => {
                if (!state.playerHits[row][col]) {
                    heatMap[row][col] += 3; 
                }
            });
        }
    
        // Calculate ship placement probabilities
        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (state.playerHits[row][col]) continue;
    
                // Check horizontal placements
                for (const ship of SHIPS) {
                    if (col + ship.size <= 10) {
                        let valid = true;
                        let adjacentHit = false;
                        
                        for (let i = 0; i < ship.size; i++) {
                            if (state.playerHits[row][col + i]) {
                                valid = false;
                                break;
                            }
                            // Check adjacent cells for hits
                            if (row > 0 && state.playerHits[row - 1][col + i]) adjacentHit = true;
                            if (row < 9 && state.playerHits[row + 1][col + i]) adjacentHit = true;
                        }
                        
                        if (valid) {
                            heatMap[row][col] += ship.size;
                            if (adjacentHit) heatMap[row][col] += 2;
                        }
                    }
                }
    
                // Check vertical placements
                for (const ship of SHIPS) {
                    if (row + ship.size <= 10) {
                        let valid = true;
                        let adjacentHit = false;
                        
                        for (let i = 0; i < ship.size; i++) {
                            if (state.playerHits[row + i][col]) {
                                valid = false;
                                break;
                            }
                            // Check adjacent cells for hits
                            if (col > 0 && state.playerHits[row + i][col - 1]) adjacentHit = true;
                            if (col < 9 && state.playerHits[row + i][col + 1]) adjacentHit = true;
                        }
                        
                        if (valid) {
                            heatMap[row][col] += ship.size;
                            if (adjacentHit) heatMap[row][col] += 2;
                        }
                    }
                }

                heatMap[row][col] += Math.random() * 2;
            }
        }

        for (let row = 0; row < 10; row++) {
            for (let col = 0; col < 10; col++) {
                if (!state.playerHits[row][col] && heatMap[row][col] > 0) {
                    cells.push({
                        row,
                        col,
                        weight: heatMap[row][col]
                    });
                }
            }
        }

        cells.sort((a, b) => b.weight - a.weight);

        const topCandidates = cells.slice(0, Math.min(5, cells.length));
        const totalWeight = topCandidates.reduce((sum, cell) => sum + cell.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const cell of topCandidates) {
            random -= cell.weight;
            if (random <= 0) {
                return { row: cell.row, col: cell.col };
            }
        }
    
        return cells[0]; 
    };
    
    const isValidMove = (row: number, col: number, playerHits: boolean[][]): boolean => {
        return row >= 0 && row < 10 && col >= 0 && col < 10 && !playerHits[row][col];
    };

    const isValidPlacement = (row: number, col: number, ship: Ship, isRotated: boolean): boolean => {
        if (!ship) return false;

        if (isRotated) {
            if (row + ship.size > 10) return false;
        } else {
            if (col + ship.size > 10) return false;
        }

        for (let i = 0; i < ship.size; i++) {
            const checkRow = isRotated ? row + i : row;
            const checkCol = isRotated ? col : col + i;
            if (gameState.playerBoard[checkRow][checkCol] !== null) {
                return false;
            }
        }

        return true;
    };

    const handleCellHover = (row: number, col: number) => {
        if (gameState.gameStatus === 'setup') {
            setHoveredCell({ row, col });
        }
    };

    const handleCellLeave = () => {
        setHoveredCell(null);
    };

    const placeShip = (row: number, col: number) => {
        if (!gameState.currentShip) {
            setGameState(prev => ({
                ...prev,
                currentShip: SHIPS[prev.placedShips.length]
            }));
            return;
        }

        const ship = gameState.currentShip;
        if (!isValidPlacement(row, col, ship, gameState.isRotated)) {
            setGameState(prev => ({
                ...prev,
                message: 'Invalid placement! Try another position.'
            }));
            return;
        }

        const newBoard = [...gameState.playerBoard];
        
        for (let i = 0; i < ship.size; i++) {
            const placeRow = gameState.isRotated ? row + i : row;
            const placeCol = gameState.isRotated ? col : col + i;
            newBoard[placeRow][placeCol] = ship.name;
        }

        const newPlacedShips = [...gameState.placedShips, {
            ...ship,
            position: { row, col },
            horizontal: !gameState.isRotated
        }];

        if (newPlacedShips.length === SHIPS.length) {
            setGameState(prev => ({
                ...prev,
                playerBoard: newBoard,
                placedShips: newPlacedShips,
                currentShip: null,
                gameStatus: 'playing',
                message: 'Game started! Make your move!'
            }));
        } else {
            setGameState(prev => ({
                ...prev,
                playerBoard: newBoard,
                placedShips: newPlacedShips,
                currentShip: null,
                message: `Place your ${SHIPS[newPlacedShips.length].name}! Press R to rotate`
            }));
        }
    };
    const makeMove = (row: number, col: number) => {
        if (gameState.gameStatus !== 'playing' || gameState.aiBoard[row][col].tried) {
            return;
        }

        const newAiBoard = [...gameState.aiBoard];
        let hit = false;

        gameState.aiShips.forEach(ship => {
            for (let i = 0; i < ship.size; i++) {
                const shipRow = ship.horizontal ? ship.position.row : ship.position.row + i;
                const shipCol = ship.horizontal ? ship.position.col + i : ship.position.col;
                
                if (shipRow === row && shipCol === col) {
                    hit = true;
                    break;
                }
            }
        });

        newAiBoard[row][col] = { tried: true, hit };
        
        const aiMove = getAIMove(gameState);
        const newPlayerHits = [...gameState.playerHits];
        const aiHit = gameState.playerBoard[aiMove.row][aiMove.col] !== null;
        newPlayerHits[aiMove.row][aiMove.col] = true;
        const newAiState = updateAIState(gameState, aiMove, aiHit);
        const newPlayerScore = gameState.playerScore + (hit ? 1 : 0);
        const newAiScore = gameState.aiScore + (aiHit ? 1 : 0);

        const isGameOver = newPlayerScore >= 17 || newAiScore >= 17;

        setGameState(prev => ({
            ...prev,
            ...newAiState,
            aiBoard: newAiBoard,
            playerHits: newPlayerHits,
            playerScore: newPlayerScore,
            aiScore: newAiScore,
            message: isGameOver 
                ? `Game Over! ${newPlayerScore >= 17 ? 'You win!' : 'AI wins!'}`
                : hit 
                    ? 'Hit! Go again!' 
                    : 'Miss! Keep trying!',
            gameStatus: isGameOver ? 'finished' : 'playing'
        }));
    };

    const updateAIState = (
        currentState: GameState,
        move: { row: number; col: number },
        isHit: boolean
    ) => {
        const newState = { ...currentState };
        
        if (isHit) {
            newState.aiHuntMode = true;
            newState.aiLastHit = move;

            const directions = [
                [-1, 0], [0, 1], [1, 0], [0, -1], // Adjacent
                [-1, -1], [-1, 1], [1, -1], [1, 1] // Diagonals
            ];

            for (let i = 0; i < 4; i++) {
                const [dx, dy] = directions[i];
                const newRow = move.row + dx;
                const newCol = move.col + dy;
                if (isValidMove(newRow, newCol, currentState.playerHits)) {
                    newState.aiTargetStack.unshift({ row: newRow, col: newCol });
                }
            }
        } else if (newState.aiHuntMode && newState.aiTargetStack.length === 0) {
            newState.aiHuntMode = false;
            newState.aiLastHit = null;
            newState.aiCurrentDirection = null;
        }

        newState.aiMoveHistory.push({ ...move, hit: isHit });
        return newState;
    };

    useEffect(() => {
        startNewGame();
        
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key.toLowerCase() === 'r' && gameState.gameStatus === 'setup') {
                setGameState(prev => ({ ...prev, isRotated: !prev.isRotated }));
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const getCellClass = (
        isPlayer: boolean,
        row: number,
        col: number
    ): string => {
        let className = 'w-8 h-8 border border-gray-400 ';

        if (isPlayer) {
            if (gameState.playerBoard[row][col]) {
                className += 'bg-blue-500 ';
            }
            if (gameState.playerHits[row][col]) {
                className += gameState.playerBoard[row][col] 
                    ? 'bg-red-500 '
                    : 'bg-gray-300 ';
            }
        } else {
            if (gameState.aiBoard[row][col].tried) {
                className += gameState.aiBoard[row][col].hit
                    ? 'bg-red-500 '
                    : 'bg-gray-300 ';
            }
        }

        if (
            hoveredCell &&
            gameState.gameStatus === 'setup' &&
            gameState.currentShip &&
            isPlayer
        ) {
            const ship = gameState.currentShip;
            if (gameState.isRotated) {
                if (
                    row >= hoveredCell.row &&
                    row < hoveredCell.row + ship.size &&
                    col === hoveredCell.col
                ) {
                    className += isValidPlacement(
                        hoveredCell.row,
                        hoveredCell.col,
                        ship,
                        true
                    )
                        ? 'bg-green-200 '
                        : 'bg-red-200 ';
                }
            } else {
                if (
                    row === hoveredCell.row &&
                    col >= hoveredCell.col &&
                    col < hoveredCell.col + ship.size
                ) {
                    className += isValidPlacement(
                        hoveredCell.row,
                        hoveredCell.col,
                        ship,
                        false
                    )
                        ? 'bg-green-200 '
                        : 'bg-red-200 ';
                }
            }
        }

        return className;
    };
    return (
        <div className="min-h-screen bg-gradient-to-b from-navy-800 to-navy-900 py-8 font-mono">
            <div className="max-w-6xl mx-auto px-4">
                {/* Title Section */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-yellow-300 mb-4 tracking-wider border-b-4 border-yellow-300 pb-2 inline-block">
                        ⚓ BATTLESHIP ⚓
                    </h1>
                    <p className="text-lg text-green-400 mb-4 font-terminal">
                        {gameState.message}
                    </p>
                    <div className="flex justify-center gap-8 mb-4">
                        <div className="text-lg text-yellow-300 border-2 border-yellow-300 px-4 py-2">
                            PLAYER: {gameState.playerScore}
                        </div>
                        <div className="text-lg text-yellow-300 border-2 border-yellow-300 px-4 py-2">
                            CPU: {gameState.aiScore}
                        </div>
                    </div>
                </div>
    
                {/* Game Boards */}
                <div className="flex flex-col md:flex-row justify-center gap-12">
                    {/* Player Board */}
                    <div className="game-board-container">
                        <h2 className="text-2xl font-semibold mb-4 text-center text-green-400">
                            YOUR FLEET
                        </h2>
                        <div className="grid grid-cols-10 gap-0 bg-navy-700 p-4 rounded-lg shadow-neon relative">
                            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-green-400">
                                {[...Array(10)].map((_, i) => (
                                    <span key={i}>{i}</span>
                                ))}
                            </div>
                            <div className="absolute top--6 left-0 right-0 flex justify-around text-green-400">
                                {['A','B','C','D','E','F','G','H','I','J'].map((letter) => (
                                    <span key={letter}>{letter}</span>
                                ))}
                            </div>
                            {gameState.playerBoard.map((row, rowIndex) => (
                                row.map((_, colIndex) => (
                                    <div
                                        key={`player-${rowIndex}-${colIndex}`}
                                        className={`
                                            ${getCellClass(true, rowIndex, colIndex)}
                                            border border-green-400/30
                                            transition-all duration-150
                                            hover:border-green-400
                                        `}
                                        onClick={() => {
                                            if (gameState.gameStatus === 'setup') {
                                                placeShip(rowIndex, colIndex);
                                            }
                                        }}
                                        onMouseEnter={() => handleCellHover(rowIndex, colIndex)}
                                        onMouseLeave={handleCellLeave}
                                    />
                                ))
                            ))}
                        </div>
                    </div>
    
                    {/* AI Board */}
                    <div className="game-board-container">
                        <h2 className="text-2xl font-semibold mb-4 text-center text-red-400">
                            ENEMY WATERS
                        </h2>
                        <div className="grid grid-cols-10 gap-0 bg-navy-700 p-4 rounded-lg shadow-neon relative">
                            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around text-red-400">
                                {[...Array(10)].map((_, i) => (
                                    <span key={i}>{i}</span>
                                ))}
                            </div>
                            <div className="absolute top--6 left-0 right-0 flex justify-around text-red-400">
                                {['A','B','C','D','E','F','G','H','I','J'].map((letter) => (
                                    <span key={letter}>{letter}</span>
                                ))}
                            </div>
                            {gameState.aiBoard.map((row, rowIndex) => (
                                row.map((_, colIndex) => (
                                    <div
                                        key={`ai-${rowIndex}-${colIndex}`}
                                        className={`
                                            ${getCellClass(false, rowIndex, colIndex)}
                                            border border-red-400/30
                                            transition-all duration-150
                                            hover:border-red-400
                                            cursor-crosshair
                                        `}
                                        onClick={() => makeMove(rowIndex, colIndex)}
                                    />
                                ))
                            ))}
                        </div>
                    </div>
                </div>
    
                {/* Game Over Modal */}
                {showGameOver && (
                    <div className="fixed inset-0 bg-navy-900/90 flex items-center justify-center backdrop-blur-sm">
                        <div className="bg-navy-800 p-8 rounded-lg shadow-neon border-2 border-yellow-300 text-center">
                            <h2 className="text-2xl font-bold mb-4 text-yellow-300">GAME OVER</h2>
                            <p className="text-xl mb-4 text-green-400">
                                {gameState.playerScore >= 17 ? 'VICTORY ACHIEVED!' : 'MISSION FAILED!'}
                            </p>
                            <button
                                className="bg-yellow-300 text-navy-900 px-6 py-2 rounded hover:bg-yellow-400 
                                         transition-all duration-200 font-bold tracking-wider"
                                onClick={startNewGame}
                            >
                                NEW MISSION
                            </button>
                        </div>
                    </div>
                )}
    
                {/* Setup Info */}
                {gameState.gameStatus === 'setup' && (
                    <div className="mt-8 text-center">
                        <p className="text-lg mb-4 text-green-400">
                            DEPLOYING: {gameState.currentShip?.name || SHIPS[gameState.placedShips.length]?.name}
                        </p>
                        <p className="text-yellow-300">
                            ORIENTATION: {gameState.isRotated ? 'VERTICAL' : 'HORIZONTAL'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Battleship;

