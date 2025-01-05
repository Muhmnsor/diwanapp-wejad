import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ActivityRatingCardProps {
  type: "highest" | "lowest";
  title: string;
  activity?: {
    eventId: string;
    title: string;
    date: string;
    averageRating: number;
    ratingsCount: number;
  };
}

export const ActivityRatingCard = ({
  type,
  title,
  activity
}: ActivityRatingCardProps) => {
  const Icon = type === "highest" ? TrendingUp : TrendingDown;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activity ? (
          <>
            <div className="text-lg font-bold truncate" title={activity.title}>
              {activity.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {activity.averageRating.toFixed(1)} من 5
            </div>
            <div className="text-xs text-muted-foreground">
              {activity.ratingsCount} تقييم
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">
            لا توجد بيانات
          </div>
        )}
      </CardContent>
    </Card>
  );
};