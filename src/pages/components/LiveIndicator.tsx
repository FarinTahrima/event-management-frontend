import React from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Users, Radio } from 'lucide-react';
import { StreamStatus } from '@/utils/streamStorage';

const LiveIndicator: React.FC<StreamStatus> = ({ isLive, viewerCount }) => (
  <div className="flex items-center space-x-4 text-white">
    <div className="flex items-center">
      <Badge 
        variant={isLive ? "destructive" : "secondary"}
        className="flex items-center gap-2"
      >
        <Radio className="w-4 h-4 animate-pulse" />
        <span>{isLive ? 'LIVE' : 'OFFLINE'}</span>
      </Badge>
    </div>
    {isLive && (
      <div className="flex items-center space-x-2">
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">{viewerCount} viewers</span>
      </div>
    )}
  </div>
);

export default LiveIndicator;