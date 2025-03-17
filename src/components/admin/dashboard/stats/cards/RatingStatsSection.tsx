
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
  lowestRated
}: RatingStatsSectionProps) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أعلى تقييم
          </CardTitle>
          <ThumbsUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          {highestRated ? (
            <>
              <div className="text-xl font-bold mb-1">{highestRated.title}</div>
              <div className="flex justify-between items-center">
                <div className="text-sm">{formatDate(highestRated.date)}</div>
                <div className="flex items-center text-sm font-semibold text-green-600">
                  {highestRated.averageRating.toFixed(1)} <Star className="h-3 w-3 ml-1" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {highestRated.ratingsCount} تقييم
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              لا توجد بيانات تقييم حالياً
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            أدنى تقييم
          </CardTitle>
          <ThumbsDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          {lowestRated ? (
            <>
              <div className="text-xl font-bold mb-1">{lowestRated.title}</div>
              <div className="flex justify-between items-center">
                <div className="text-sm">{formatDate(lowestRated.date)}</div>
                <div className="flex items-center text-sm font-semibold text-red-600">
                  {lowestRated.averageRating.toFixed(1)} <Star className="h-3 w-3 ml-1" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {lowestRated.ratingsCount} تقييم
              </p>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              لا توجد بيانات تقييم حالياً
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};
