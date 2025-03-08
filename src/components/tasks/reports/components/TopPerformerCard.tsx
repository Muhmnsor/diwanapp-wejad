
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Award, Clock, CheckCircle } from "lucide-react";
import { TopPerformer } from "../hooks/useTopPerformers";

interface TopPerformerCardProps {
  performer: TopPerformer;
  metric?: 'completion' | 'onTime' | 'speed' | 'productivity' | 'achievements';
  showRank?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const TopPerformerCard = ({ 
  performer, 
  metric = 'completion',
  showRank = true,
  size = 'md' 
}: TopPerformerCardProps) => {
  // Define icon and metric value based on selected metric
  let icon = <Trophy className="h-5 w-5 text-amber-500" />;
  let metricValue = "";
  let metricLabel = "";
  
  switch (metric) {
    case 'completion':
      metricValue = `${performer.stats.completionRate}%`;
      metricLabel = "نسبة الإنجاز";
      icon = <Trophy className="h-5 w-5 text-amber-500" />;
      break;
    case 'onTime':
      metricValue = `${performer.stats.onTimeRate}%`;
      metricLabel = "الالتزام بالمواعيد";
      icon = <CheckCircle className="h-5 w-5 text-green-500" />;
      break;
    case 'speed':
      metricValue = `${performer.stats.averageCompletionTime} ساعة`;
      metricLabel = "متوسط وقت الإنجاز";
      icon = <Clock className="h-5 w-5 text-blue-500" />;
      break;
    case 'productivity':
      metricValue = `${performer.stats.completedTasks}`;
      metricLabel = "المهام المنجزة";
      icon = <CheckCircle className="h-5 w-5 text-primary" />;
      break;
    case 'achievements':
      metricValue = `${performer.achievements}`;
      metricLabel = "الإنجازات";
      icon = <Award className="h-5 w-5 text-purple-500" />;
      break;
  }
  
  const isLarge = size === 'lg';
  const isSmall = size === 'sm';
  
  return (
    <Card className={`overflow-hidden transition-all hover:shadow-md ${isLarge ? 'border-2 border-primary/10' : ''}`}>
      <CardContent className={`p-4 ${isLarge ? 'p-5' : ''} ${isSmall ? 'p-3' : ''}`}>
        <div className="flex items-center gap-3">
          {showRank && performer.rank && (
            <div className={`flex-shrink-0 flex items-center justify-center rounded-full font-bold ${
              performer.rank === 1 ? 'bg-amber-100 text-amber-600' : 
              performer.rank === 2 ? 'bg-slate-100 text-slate-600' : 
              performer.rank === 3 ? 'bg-amber-50 text-amber-700' : 
              'bg-gray-100 text-gray-500'
            } ${isLarge ? 'w-8 h-8' : 'w-6 h-6'} ${isSmall ? 'w-5 h-5 text-xs' : ''}`}>
              {performer.rank}
            </div>
          )}
          
          <Avatar className={`${isLarge ? 'h-12 w-12' : 'h-10 w-10'} ${isSmall ? 'h-8 w-8' : ''}`}>
            <AvatarImage src={performer.avatarUrl} alt={performer.name} />
            <AvatarFallback>{performer.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className={`font-semibold text-foreground ${isSmall ? 'text-sm' : ''}`}>
                  {performer.name}
                </h3>
                {!isSmall && performer.email && (
                  <p className="text-xs text-muted-foreground">{performer.email}</p>
                )}
              </div>
              
              {performer.rank === 1 && !isSmall && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  متفوق الشهر
                </Badge>
              )}
            </div>
            
            <div className={`flex items-center gap-1 mt-1 ${isSmall ? 'text-xs' : 'text-sm'}`}>
              {icon}
              <span className={`font-medium ${isLarge ? 'text-base' : ''}`}>{metricValue}</span>
              <span className="text-muted-foreground mr-1">{metricLabel}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
