
import { Badge } from "@/components/ui/badge";
import { TopPerformer } from "../hooks/useTopPerformers";
import { Trophy, Clock, CheckCircle, Zap, Award } from "lucide-react";

interface PerformerBadgeProps {
  performer: TopPerformer;
  category: string;
  rank: number;
}

export const PerformerBadge = ({ performer, category, rank }: PerformerBadgeProps) => {
  const getBadgeColor = () => {
    if (rank === 1) return "bg-amber-500";
    if (rank === 2) return "bg-gray-400";
    if (rank === 3) return "bg-amber-700";
    return "bg-primary";
  };

  const getBadgeIcon = () => {
    switch (category) {
      case 'completion':
        return <CheckCircle className="w-3 h-3 mr-1" />;
      case 'onTime':
        return <Clock className="w-3 h-3 mr-1" />;
      case 'speed':
        return <Zap className="w-3 h-3 mr-1" />;
      case 'productivity':
        return <Award className="w-3 h-3 mr-1" />;
      case 'achievements':
        return <Trophy className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const getBadgeText = () => {
    switch (category) {
      case 'completion':
        return `أكمل ${performer.stats.completedTasks} مهمة`;
      case 'onTime':
        return `${(performer.stats.onTimeRate * 100).toFixed(0)}% في الموعد`;
      case 'speed':
        return `${performer.stats.averageCompletionTime.toFixed(1)} أيام للمهمة`;
      case 'productivity':
        return `${(performer.stats.completionRate * 100).toFixed(0)}% معدل الإكمال`;
      case 'achievements':
        return `${performer.stats.achievements} إنجازات`;
      default:
        return '';
    }
  };

  return (
    <Badge 
      className={`flex items-center ${getBadgeColor()} hover:${getBadgeColor()}`}
      variant="secondary"
    >
      {getBadgeIcon()}
      {getBadgeText()}
    </Badge>
  );
};
