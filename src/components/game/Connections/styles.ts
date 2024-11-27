export const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center' as const,
      fontFamily: 'Arial, sans-serif',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '10px',
      margin: '20px 0',
    },
    wordTile: {
      padding: '15px',
      fontSize: '16px',
      fontWeight: 'bold',
      border: '2px solid #ccc',
      borderRadius: '5px',
      background: 'white',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textTransform: 'uppercase' as const,
    },
    selectedTile: {
      background: '#e6f3ff',
      borderColor: '#2196f3',
    },
    solvedTile: {
      cursor: 'not-allowed',
    },
    submitButton: {
      padding: '10px 20px',
      fontSize: '16px',
      backgroundColor: '#2196f3',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    disabledButton: {
      backgroundColor: '#ccc',
      cursor: 'not-allowed',
    },
    gameOver: {
      color: '#f44336',
      fontWeight: 'bold',
      fontSize: '1.2em',
    },
    winner: {
      color: '#4caf50',
      fontWeight: 'bold',
      fontSize: '1.2em',
    },
    difficultySelector: {
      marginBottom: '20px',
    },
    difficultyButton: {
      padding: '10px 20px',
      margin: '0 10px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
    },
    activeDifficulty: {
      backgroundColor: '#2196f3',
      color: 'white',
    },
    inactiveDifficulty: {
      backgroundColor: '#e0e0e0',
      color: 'black',
    },
  };
  