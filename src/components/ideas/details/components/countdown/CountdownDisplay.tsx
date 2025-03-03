
import React from "react";
import { getCountdownDisplay } from "../../utils/countdownUtils";
import { CountdownTime } from "../../utils/countdownUtils";

interface CountdownDisplayProps {
  discussion_period?: string;
  created_at: string;
  countdown: CountdownTime;
}

export const CountdownDisplay: React.FC<CountdownDisplayProps> = ({ 
  discussion_period, 
  created_at, 
  countdown 
}) => {
  return (
    <div className="flex items-center gap-2 bg-blue-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-blue-800">متبقي للمناقشة:</span>
      <div className="font-bold text-blue-700">
        {getCountdownDisplay(discussion_period, created_at, countdown)}
      </div>
    </div>
  );
};
