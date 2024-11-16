import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { SentimentHistoryItem, ChartDataPoint } from '../types/types';
import { useNavigate } from 'react-router-dom';

const SentimentDashboard: React.FC = () => {
  const [sentimentHistory, setSentimentHistory] = useState<SentimentHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSentimentHistory();
  }, []);

  const fetchSentimentHistory = async (): Promise<void> => {
    try {
      const response = await fetch('http://localhost:3000/sentiment-history');
      const data = await response.json();
      setSentimentHistory(data);
    } catch (error) {
      console.error('Error fetching sentiment history:', error);
      setSentimentHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = (data: SentimentHistoryItem[]): ChartDataPoint[] => {
    return data.map(item => {
      try {
        const score = item.sentiment?.score ?? 0;
        return {
          time: new Date(item.timestamp).toLocaleTimeString(),
          sentiment: score,
          message: item.message || '',
        };
      } catch (error) {
        console.error('Error formatting item:', item, error);
        return {
          time: new Date().toLocaleTimeString(),
          sentiment: 0,
          message: '',
        };
      }
    });
  };

  const getSentimentColor = (score: number): string => {
    if (score >= 4) return 'bg-green-100';
    if (score >= 3) return 'bg-blue-100';
    if (score >= 2) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getSentimentEmoji = (score: number): string => {
    if (score >= 4) return '😊';
    if (score >= 3) return '🙂';
    if (score >= 2) return '😐';
    return '😟';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (sentimentHistory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <p className="text-xl text-gray-600">No sentiment data available</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </div>
    );
  }

  const chartData = formatChartData(sentimentHistory);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Sentiment Analysis Dashboard</h1>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            ← Back
          </button>
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Sentiment Timeline</h2>
          <div className="overflow-x-auto">
            <LineChart
              width={800}
              height={400}
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" stroke="#666" />
              <YAxis domain={[0, 5]} stroke="#666" />
              <Tooltip
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #ddd' }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="sentiment"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </div>
        </div>

        {/* Messages Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Recent Messages</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto">
            {sentimentHistory.slice(-10).reverse().map((item) => (
              <div
                key={item.messageId}
                className={`p-4 rounded-lg border border-gray-200 transition-all hover:shadow-md ${getSentimentColor(item.sentiment?.score || 0)}`}
              >
                <div className="flex items-start justify-between">
                  <p className="font-medium text-gray-800">{item.message}</p>
                  <span className="text-2xl ml-4">{getSentimentEmoji(item.sentiment?.score || 0)}</span>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>
                    Sentiment: {item.sentiment?.label || 'N/A'} ({(item.sentiment?.score || 0).toFixed(2)})
                  </span>
                  <span>
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

