export interface Category {
    words: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    color: string;
  }
  
  export interface Categories {
    [key: string]: {
      easy: Category;
      medium: Category;
      hard: Category;
    };
  }
  
  export const categories: Categories = {
    colors: {
      easy: {
        words: ['RED', 'BLUE', 'GREEN', 'PINK'],
        difficulty: 'easy',
        color: '#FFB6B6'
      },
      medium: {
        words: ['CRIMSON', 'AZURE', 'EMERALD', 'MAGENTA'],
        difficulty: 'medium',
        color: '#FFB6B6'
      },
      hard: {
        words: ['VERMILLION', 'CERULEAN', 'CHARTREUSE', 'FUCHSIA'],
        difficulty: 'hard',
        color: '#FFB6B6'
      }
    },
    animals: {
      easy: {
        words: ['DOG', 'CAT', 'BIRD', 'FISH'],
        difficulty: 'easy',
        color: '#B6FFB6'
      },
      medium: {
        words: ['DOLPHIN', 'LEOPARD', 'FALCON', 'PYTHON'],
        difficulty: 'medium',
        color: '#B6FFB6'
      },
      hard: {
        words: ['PLATYPUS', 'PANGOLIN', 'AXOLOTL', 'NARWHAL'],
        difficulty: 'hard',
        color: '#B6FFB6'
      }
    },
    food: {
      easy: {
        words: ['PIZZA', 'PASTA', 'BREAD', 'CAKE'],
        difficulty: 'easy',
        color: '#B6B6FF'
      },
      medium: {
        words: ['SUSHI', 'PAELLA', 'RISOTTO', 'QUICHE'],
        difficulty: 'medium',
        color: '#B6B6FF'
      },
      hard: {
        words: ['BOUILLABAISSE', 'RATATOUILLE', 'GOULASH', 'POUTINE'],
        difficulty: 'hard',
        color: '#B6B6FF'
      }
    },
    clothes: {
      easy: {
        words: ['SHIRT', 'PANTS', 'SHOES', 'SOCKS'],
        difficulty: 'easy',
        color: '#FFE4B6'
      },
      medium: {
        words: ['CARDIGAN', 'LEGGINGS', 'LOAFERS', 'BLAZER'],
        difficulty: 'medium',
        color: '#FFE4B6'
      },
      hard: {
        words: ['ESPADRILLES', 'BALACLAVA', 'JODHPURS', 'CRAVAT'],
        difficulty: 'hard',
        color: '#FFE4B6'
      }
    },
  };
  