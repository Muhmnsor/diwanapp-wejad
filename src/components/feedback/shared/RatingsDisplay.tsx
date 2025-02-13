
import { Card } from "@/components/ui/card";

interface RatingsDisplayProps {
  ratings: {
    overall: number;
    content: number;
    organization: number;
    presenter: number;
  };
}

export const RatingsDisplay = ({ ratings }: RatingsDisplayProps) => {
  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600 bg-green-50';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const ratingLabels = {
    overall: 'التقييم العام',
    content: 'تقييم المحتوى',
    organization: 'تقييم التنظيم',
    presenter: 'تقييم المقدم'
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {Object.entries(ratings).map(([key, value]) => (
        <Card key={key} className={`p-4 ${getRatingColor(value)}`}>
          <div className="flex flex-col items-center justify-center text-center">
            <span className="text-sm font-medium mb-2">
              {ratingLabels[key as keyof typeof ratingLabels]}
            </span>
            <span className="text-2xl font-bold">
              {value.toFixed(1)}
            </span>
            <span className="text-xs mt-1">من 5</span>
          </div>
        </Card>
      ))}
    </div>
  );
};
