
import { useEffect, useState } from "react";
import { calculateTimeRemaining, getCountdownDisplay, CountdownTime } from "../utils/countdownUtils";

interface IdeaCountdownProps {
  discussion_period?: string;
  created_at: string;
}

export const IdeaCountdown = ({ discussion_period, created_at }: IdeaCountdownProps) => {
  const [countdown, setCountdown] = useState<CountdownTime>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const timeLeft = calculateTimeRemaining(discussion_period, created_at);
      setCountdown(timeLeft);
    };

    const timer = setInterval(calculateTimeLeft, 1000);
    calculateTimeLeft();

    return () => clearInterval(timer);
  }, [discussion_period, created_at]);

  return (
    <div className="flex items-center gap-2 bg-purple-50 rounded-lg py-1.5 px-2 text-sm">
      <span className="font-medium text-purple-800">متبقي:</span>
      <div className="font-bold text-purple-700">
        {getCountdownDisplay(discussion_period, created_at, countdown)}
      </div>
    </div>
  );
};
