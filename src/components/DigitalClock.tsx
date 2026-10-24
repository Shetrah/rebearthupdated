import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex items-center space-x-2 text-sm">
      <Clock className="h-4 w-4 text-green-600" />
      <div className="flex flex-col">
        <span className="font-mono font-semibold text-gray-800">
          {formatTime(time)}
        </span>
        <span className="text-xs text-gray-600 hidden lg:block">
          {formatDate(time)}
        </span>
      </div>
    </div>
  );
};

export default DigitalClock;