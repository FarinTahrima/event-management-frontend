import React, { useState, useEffect } from 'react';
import { styles } from './styles';
import { categories, Category, Categories } from './gameData';

const Connections: React.FC = () => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [solvedGroups, setSolvedGroups] = useState<string[][]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState<number>(0);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setMistakes(0);
    setSolvedGroups([]);
    setSelectedWords([]);
    
    const allWords: string[] = Object.values(categories).map(category => 
      category[selectedDifficulty].words
    ).flat();
    setShuffledWords([...allWords].sort(() => Math.random() - 0.5));
  };

  const resetGame = () => {
    setGameStarted(false);
    setMistakes(0);
    setSolvedGroups([]);
    setSelectedWords([]);
    setShuffledWords([]);
  };

  const getCurrentCategories = () => {
    return Object.fromEntries(
      Object.entries(categories).map(([key, value]) => [key, value[difficulty]])
    );
  };

  const handleWordClick = (word: string): void => {
    if (solvedGroups.flat().includes(word)) return;

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const checkSelection = (): void => {
    if (selectedWords.length !== 4) return;

    const currentCategories = getCurrentCategories();
    for (const category of Object.values(currentCategories)) {
      if (selectedWords.every(word => category.words.includes(word))) {
        setSolvedGroups([...solvedGroups, selectedWords]);
        setSelectedWords([]);
        return;
      }
    }

    setMistakes(prev => prev + 1);
    setSelectedWords([]);
  };

  const getWordColor = (word: string): string => {
    const solvedGroup = solvedGroups.find(group => group.includes(word));
    if (solvedGroup) {
      const currentCategories = getCurrentCategories();
      const category = Object.values(currentCategories).find(cat => 
        cat.words.every(w => solvedGroup.includes(w))
      );
      return category?.color || '';
    }
    return '';
  };

  return (
    <div style={styles.container}>
      <h2>Connections</h2>
      
      {!gameStarted ? (
        <div style={styles.difficultySelector}>
          <h3>Select Difficulty</h3>
          {['easy', 'medium', 'hard'].map((diff) => (
            <button
              key={diff}
              style={{
                ...styles.difficultyButton,
                ...styles.inactiveDifficulty,
              }}
              onClick={() => startGame(diff as 'easy' | 'medium' | 'hard')}
            >
              {diff.charAt(0).toUpperCase() + diff.slice(1)}
            </button>
          ))}
        </div>
      ) : (
        <>
          <p>Find groups of 4 related words. You have 4 mistakes allowed.</p>
          <p>Difficulty: {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</p>
          <p>Mistakes: {mistakes}/4</p>

          <div style={styles.grid}>
            {shuffledWords.map((word, index) => {
              const isSelected = selectedWords.includes(word);
              const isSolved = solvedGroups.flat().includes(word);
              const backgroundColor = getWordColor(word);

              return (
                <button
                  key={`${word}-${index}`}
                  style={{
                    ...styles.wordTile,
                    ...(isSelected ? styles.selectedTile : {}),
                    ...(isSolved ? styles.solvedTile : {}),
                    backgroundColor: backgroundColor || (isSelected ? '#e6f3ff' : 'white'),
                  }}
                  onClick={() => handleWordClick(word)}
                  disabled={isSolved}
                >
                  {word}
                </button>
              );
            })}
          </div>

          <button 
            style={{
              ...styles.submitButton,
              ...(selectedWords.length !== 4 ? styles.disabledButton : {})
            }}
            onClick={checkSelection}
            disabled={selectedWords.length !== 4}
          >
            Submit Selection
          </button>

          {(mistakes >= 4 || solvedGroups.length === 4) && (
            <button
              style={{
                ...styles.submitButton,
                marginLeft: '10px'
              }}
              onClick={resetGame}
            >
              Play Again
            </button>
          )}

          {mistakes >= 4 && <p style={styles.gameOver}>Game Over!</p>}
          {solvedGroups.length === 4 && <p style={styles.winner}>Congratulations! You won!</p>}
        </>
      )}
    </div>
  );
};

export default Connections;

