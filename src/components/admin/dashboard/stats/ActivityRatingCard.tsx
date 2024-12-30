import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ActivityRatingCardProps {
  type: "highest" | "lowest";
  title: string;
  activity: {
    title: string;
    date: string;
    rating: number;
  } | null;
}

export const ActivityRatingCard = ({
  type,
  title,
  activity
}: ActivityRatingCardProps) => {
  const Icon = type === "highest" ? TrendingUp : TrendingDown;
  const iconColorClass = type === "highest" ? "text-green-500" : "text-red-500";

  if (!activity) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className={`h-4 w-4 ${iconColorClass}`} />
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">لا توجد تقييمات بعد</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColorClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{activity.rating.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground mt-1 space-y-1">
          <div>{activity.title}</div>
          <div className="text-xs opacity-70">{activity.date}</div>
        </div>
      </CardContent>
    </Card>
  );
};