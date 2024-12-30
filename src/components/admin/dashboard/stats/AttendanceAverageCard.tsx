import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface AttendanceAverageCardProps {
  averageAttendance: number;
}

export const AttendanceAverageCard = ({ averageAttendance }: AttendanceAverageCardProps) => {
  console.log("Rendering AttendanceAverageCard with average:", averageAttendance);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">متوسط الحضور</CardTitle>
        <Users className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {averageAttendance || 0}%
        </div>
      </CardContent>
    </Card>
  );
};