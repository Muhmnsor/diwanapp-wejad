import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, UserMinus } from "lucide-react";

interface ActivityAttendanceCardProps {
  type: "highest" | "lowest";
  title: string;
  activity?: {
    eventId: string;
    count: number;
    event: {
      title: string;
      date: string;
    };
  };
}

export const ActivityAttendanceCard = ({
  type,
  title,
  activity
}: ActivityAttendanceCardProps) => {
  const Icon = type === "highest" ? UserPlus : UserMinus;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {activity ? (
          <>
            <div className="text-lg font-bold truncate" title={activity.event.title}>
              {activity.event.title}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {activity.count} حاضر
            </div>
            <div className="text-xs text-muted-foreground">
              {activity.event.date}
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