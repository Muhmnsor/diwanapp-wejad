
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TopPerformer } from "../hooks/useTopPerformers";
import { Trophy, Award, Star } from "lucide-react";

interface PerformerBadgeProps {
  performer: TopPerformer;
  position: number;
  size?: 'sm' | 'md' | 'lg';
}

export const PerformerBadge = ({ performer, position, size = 'md' }: PerformerBadgeProps) => {
  // Determine badge styling based on position
  const getBadgeColor = () => {
    switch (position) {
      case 1:
        return "bg-gradient-to-r from-amber-500 to-yellow-400 text-white";
      case 2:
        return "bg-gradient-to-r from-slate-400 to-slate-300 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-700 to-amber-600 text-white";
      default:
        return "bg-gradient-to-r from-gray-200 to-gray-100 text-gray-700";
    }
  };
  
  const getBadgeIcon = () => {
    switch (position) {
      case 1:
        return <Trophy className="h-4 w-4" />;
      case 2:
        return <Star className="h-4 w-4" />;
      case 3:
        return <Award className="h-4 w-4" />;
      default:
        return null;
    }
  };

  // Set size classes
  const containerSizeClass = 
    size === 'lg' ? 'h-20 w-20' : 
    size === 'sm' ? 'h-14 w-14' : 
    'h-16 w-16';
  
  const avatarSizeClass = 
    size === 'lg' ? 'h-16 w-16 text-xl' : 
    size === 'sm' ? 'h-12 w-12 text-xs' : 
    'h-14 w-14 text-sm';
  
  const badgeSizeClass = 
    size === 'lg' ? 'h-7 w-7 text-base bottom-0 right-0' : 
    size === 'sm' ? 'h-5 w-5 text-xs bottom-0 right-0' : 
    'h-6 w-6 text-sm bottom-0 right-0';
  
  return (
    <div className={`relative ${containerSizeClass}`}>
      <Avatar className={`${avatarSizeClass} border-2 border-white shadow-md`}>
        <AvatarImage src={performer.avatarUrl} alt={performer.name} />
        <AvatarFallback className="font-bold">{performer.name.substring(0, 2)}</AvatarFallback>
      </Avatar>
      
      <div className={`absolute flex items-center justify-center rounded-full ${getBadgeColor()} ${badgeSizeClass}`}>
        {getBadgeIcon() || position}
      </div>
    </div>
  );
};
