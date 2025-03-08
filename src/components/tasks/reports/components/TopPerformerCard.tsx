
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopPerformer } from "../hooks/useTopPerformers";
import { Trophy, Clock, CheckCircle } from "lucide-react";
import { formatCurrency } from "@/components/finance/reports/utils/formatters";

interface TopPerformerCardProps {
  performer: TopPerformer;
  metric: 'completion' | 'onTime' | 'speed' | 'productivity' | 'achievements';
  showRank?: boolean;
  rank?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const TopPerformerCard = ({ 
  performer, 
  metric,
  showRank = false,
  rank = 1,
  size = 'md'
}: TopPerformerCardProps) => {
  const getInitials = (name: string) => {
    return name.trim().split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const getMetricValue = () => {
    switch (metric) {
      case 'completion':
        return `${performer.stats.completedTasks} مهام`;
      case 'onTime':
        return `${(performer.stats.onTimeRate * 100).toFixed(0)}%`;
      case 'speed':
        return `${performer.stats.averageCompletionTime.toFixed(1)} أيام`;
      case 'productivity':
        return `${(performer.stats.completionRate * 100).toFixed(0)}%`;
      case 'achievements':
        return `${performer.stats.achievements} إنجازات`;
      default:
        return '';
    }
  };
  
  const getMetricIcon = () => {
    switch (metric) {
      case 'completion':
      case 'productivity':
        return <CheckCircle className="w-4 h-4" />;
      case 'onTime':
      case 'speed':
        return <Clock className="w-4 h-4" />;
      case 'achievements':
        return <Trophy className="w-4 h-4" />;
      default:
        return null;
    }
  };
  
  const getAvatarSize = () => {
    switch (size) {
      case 'sm': return 'h-8 w-8';
      case 'md': return 'h-10 w-10';
      case 'lg': return 'h-12 w-12';
      default: return 'h-10 w-10';
    }
  };
  
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };
  
  return (
    <div className="flex items-center justify-between bg-card hover:bg-accent/5 transition-colors p-2 rounded-md">
      <div className="flex items-center gap-3">
        {showRank && (
          <div className={`font-bold ${sizeClasses[size]} text-muted-foreground w-5`}>
            {rank}.
          </div>
        )}
        <Avatar className={getAvatarSize()}>
          <AvatarImage src={performer.avatar} alt={performer.name} />
          <AvatarFallback>{getInitials(performer.name)}</AvatarFallback>
        </Avatar>
        <div>
          <p className={`font-medium ${sizeClasses[size]}`}>{performer.name}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1.5 text-primary">
        {getMetricIcon()}
        <span className={`font-semibold ${sizeClasses[size]}`}>
          {getMetricValue()}
        </span>
      </div>
    </div>
  );
};
