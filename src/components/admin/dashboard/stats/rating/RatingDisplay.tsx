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

  return (
    <div>
      <div className={`text-2xl font-bold ${getRatingColor(rating)}`}>
        {rating.toFixed(1)}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        متوسط تقييم جميع أنشطة المشروع
      </p>
    </div>
  );
};