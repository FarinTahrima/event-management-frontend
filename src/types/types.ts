export interface Question {
  id: string;
  text: string;
  votes: number;
  hasVoted: boolean;
  isSelected: boolean;
  timestamp: Date;
  moderationStatus: 'pending' | 'approved' | 'flagged';  
}
    
export type SortType = 'votes' | 'time';

export interface Message {
    content: string;
    messageID: string;
    sender: string;
    timestamp?: Date;
  }
  
  export interface MessageWithSentiment extends Message {
    sentiment: {
      label: string;
      score: number;
    };
  }
  
  export interface SentimentHistoryItem {
    messageId: string;
    message: string;
    timestamp: string;
    sentiment: {
      label: string;
      score: number;
    };
  }
  
  export interface ChartDataPoint {
    time: string;
    sentiment: number;
    message: string;
  }