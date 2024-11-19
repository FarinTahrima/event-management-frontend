import { useEffect, useState, useRef, useMemo } from 'react';
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer} from 'recharts';
import { SentimentHistoryItem, ChartDataPoint } from '../types/types';
import { useNavigate } from 'react-router-dom';

const SentimentDashboard: React.FC = () => {
  const [sentimentHistory, setSentimentHistory] = useState<SentimentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(30000);
  const navigate = useNavigate();
  const controllerRef = useRef<AbortController | null>(null);

  // Helper function to normalize messages
  const normalizeMessage = (message: string): string => {
    return message?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
  };

  const fetchSentimentHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:3000/sentiment-history', {
        signal: controllerRef.current?.signal,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Create a Map using normalized message content as key
      const latestMessages = new Map<string, SentimentHistoryItem>();
      
      data.forEach((item: SentimentHistoryItem) => {
        if (!item.message) return; // Skip items with no message
        
        const normalizedMessage = normalizeMessage(item.message);
        const existingItem = latestMessages.get(normalizedMessage);
        
        // Keep the most recent version of duplicate messages
        if (!existingItem || new Date(item.timestamp) > new Date(existingItem.timestamp)) {
          latestMessages.set(normalizedMessage, item);
        }
      });

      // Convert Map back to array and sort by timestamp
      const uniqueData = Array.from(latestMessages.values())
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setSentimentHistory(uniqueData);
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setError(error.message);
      }
      console.error('Error fetching sentiment history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    controllerRef.current = new AbortController();
    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      await fetchSentimentHistory();
    };

    fetchData();
    intervalId = setInterval(fetchData, refreshInterval);

    return () => {
      controllerRef.current?.abort();
      clearInterval(intervalId);
    };
  }, [refreshInterval]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    return [...sentimentHistory]
      .reverse()
      .map(item => ({
        time: new Date(item.timestamp).toLocaleTimeString(),
        sentiment: item.sentiment?.score ?? 0,
        message: item.message || '',
      }));
  }, [sentimentHistory]);

  // Memoize sentiment style helpers
  const getSentimentColor = useMemo(() => (score: number): string => {
    if (score >= 4) return 'bg-green-900/30';
    if (score >= 3) return 'bg-blue-900/30';
    if (score >= 2) return 'bg-yellow-900/30';
    return 'bg-red-900/30';
  }, []);

  const getSentimentEmoji = useMemo(() => (score: number): string => {
    if (score >= 4) return '😊';
    if (score >= 3) return '🙂';
    if (score >= 2) return '😐';
    return '😟';
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (sentimentHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <p className="text-xl text-gray-300">No sentiment data available</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Sentiment Analysis Dashboard</h1>
            <p className="text-gray-400 mt-2">Real-time sentiment tracking and analysis</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-gray-300 rounded px-3 py-2"
            >
              <option value={5000}>Refresh: 5s</option>
              <option value={15000}>Refresh: 15s</option>
              <option value={30000}>Refresh: 30s</option>
              <option value={60000}>Refresh: 1m</option>
            </select>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 mb-8 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Sentiment Timeline</h2>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickFormatter={(value) => value.split(' ')[0]}
                />
                <YAxis 
                  domain={[0, 5]} 
                  stroke="#9CA3AF"
                  tick={{ fontSize: 12, fill: '#9CA3AF' }}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    borderRadius: '8px', 
                    border: '1px solid #374151',
                    color: '#F3F4F6',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#60A5FA"
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                  name="Sentiment Score"
                  dot={{ fill: '#60A5FA' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-gray-900 rounded-lg shadow-xl p-6 border border-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-gray-100">Recent Messages</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
            {sentimentHistory.map((item) => (
              <div
                key={`${normalizeMessage(item.message)}-${item.timestamp}`}
                className={`p-4 rounded-lg border border-gray-700 transition-all hover:shadow-lg ${getSentimentColor(
                  item.sentiment?.score || 0
                )}`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-200">{item.message}</p>
                  <span className="text-2xl ml-4 filter drop-shadow">
                    {getSentimentEmoji(item.sentiment?.score || 0)}
                  </span>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-400">
                  <span className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      item.sentiment?.score >= 4 ? 'bg-green-500' :
                      item.sentiment?.score >= 3 ? 'bg-blue-500' :
                      item.sentiment?.score >= 2 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}></div>
                    Sentiment: {item.sentiment?.label || 'N/A'} (
                    {(item.sentiment?.score || 0).toFixed(2)})
                  </span>
                  <span className="text-gray-500">
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentDashboard;

