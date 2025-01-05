import { ActivityRatingCard } from "../ActivityRatingCard";

interface RatingStatsSectionProps {
  highestRated?: {
    eventId: string;
    title: string;
    date: string;
    averageRating: number;
    ratingsCount: number;
  } | null;
  lowestRated?: {
    eventId: string;
    title: string;
    date: string;
    averageRating: number;
    ratingsCount: number;
  } | null;
}

export const RatingStatsSection = ({
  highestRated,
  lowestRated,
}: RatingStatsSectionProps) => {
  return (
    <>
      <ActivityRatingCard
        type="highest"
        title="أعلى نشاط تقييماً"
        activity={highestRated}
      />
      <ActivityRatingCard
        type="lowest"
        title="أقل نشاط تقييماً"
        activity={lowestRated}
      />
    </>
  );
};