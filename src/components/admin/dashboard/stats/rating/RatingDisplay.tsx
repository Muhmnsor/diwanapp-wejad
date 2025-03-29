
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number;
}

export const RatingDisplay = ({ rating }: RatingDisplayProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBackgroundColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-50';
    if (rating >= 3) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 p-3 rounded-lg ${getBackgroundColor(rating)}`}>
        <Star className={`h-5 w-5 ${getRatingColor(rating)}`} />
        <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
          {rating.toFixed(1)}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        متوسط تقييم جميع أنشطة المشروع
      </p>
    </div>
  );
};
