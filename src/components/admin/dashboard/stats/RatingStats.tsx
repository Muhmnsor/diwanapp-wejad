import { Star } from "lucide-react";
import { StatCard } from "./StatCard";

interface RatingStatsProps {
  projectActivities?: {
    id: string;
    title: string;
    attendanceRate?: number;
    rating?: number;
  }[];
}

export const RatingStats = ({ projectActivities = [] }: RatingStatsProps) => {
  const sortedByRating = [...(projectActivities || [])].sort((a, b) => 
    (b.rating || 0) - (a.rating || 0)
  );
  const highestRated = sortedByRating[0];

  return (
    <StatCard
      title="أعلى تقييم نشاط"
      value={highestRated?.title || '-'}
      subtitle={`${highestRated?.rating?.toFixed(1) || 0} من 5`}
      icon={Star}
    />
  );
};