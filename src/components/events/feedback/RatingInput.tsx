import { useState } from "react";
import { Star, StarOff } from "lucide-react";

interface RatingInputProps {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  description?: string;
}

export const RatingInput = ({ label, value, onChange, description }: RatingInputProps) => {
  const [hover, setHover] = useState<number | null>(null);

  const getRatingColor = (rating: number) => {
    if (rating <= 2) return "text-red-500";
    if (rating <= 3) return "text-yellow-500";
    return "text-green-500";
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return "ضعيف جداً";
      case 2: return "ضعيف";
      case 3: return "متوسط";
      case 4: return "جيد";
      case 5: return "ممتاز";
      default: return "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        {value && (
          <span className={`text-sm ${getRatingColor(value)}`}>
            {getRatingText(value)}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 mb-2">{description}</p>
      )}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            className={`transition-all ${
              (hover || value) && rating <= (hover || value)
                ? getRatingColor(rating)
                : "text-gray-300"
            }`}
            onMouseEnter={() => setHover(rating)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(rating)}
          >
            {(hover || value) && rating <= (hover || value) ? (
              <Star className="w-6 h-6 fill-current" />
            ) : (
              <StarOff className="w-6 h-6" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};