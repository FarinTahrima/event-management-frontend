export interface StreamStatus {
    isLive: boolean;
    viewerCount: number;
    sessionId?: string;
  }
  
  export const streamStorage = {
    setStreamStatus: (status: StreamStatus) => {
      try {
        localStorage.setItem('streamStatus', JSON.stringify(status));
      } catch (error) {
        console.error('Error saving stream status:', error);
      }
    },
  
    getStreamStatus: (): StreamStatus => {
      try {
        const stored = localStorage.getItem('streamStatus');
        return stored ? JSON.parse(stored) : { isLive: false, viewerCount: 0 };
      } catch (error) {
        console.error('Error reading stream status:', error);
        return { isLive: false, viewerCount: 0 };
      }
    },
  
    clearStreamStatus: () => {
      try {
        localStorage.removeItem('streamStatus');
      } catch (error) {
        console.error('Error clearing stream status:', error);
      }
    },
  
    updateStreamStatus: (updates: Partial<StreamStatus>) => {
      const currentStatus = streamStorage.getStreamStatus();
      streamStorage.setStreamStatus({ ...currentStatus, ...updates });
      return { ...currentStatus, ...updates };
    }
  };