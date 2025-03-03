
import { useCountdown } from "../hooks/useCountdown";
import { CountdownDisplay } from "./countdown/CountdownDisplay";
import { ExpiredCountdown } from "./countdown/ExpiredCountdown";
import { UnsetCountdown } from "./countdown/UnsetCountdown";

interface IdeaCountdownProps {
  discussion_period?: string;
  created_at: string;
  ideaId?: string;
}

export const IdeaCountdown = ({ discussion_period, created_at, ideaId }: IdeaCountdownProps) => {
  const { countdown, isExpired } = useCountdown({
    discussion_period,
    created_at,
    ideaId
  });

  if (!discussion_period) {
    return <UnsetCountdown />;
  }

  if (isExpired) {
    return <ExpiredCountdown />;
  }

  return (
    <CountdownDisplay 
      discussion_period={discussion_period} 
      created_at={created_at} 
      countdown={countdown}
    />
  );
};
