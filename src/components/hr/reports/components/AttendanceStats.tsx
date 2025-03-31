
import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, UserX, Clock, Users } from "lucide-react";

interface AttendanceStatsProps {
  stats: {
    totalRecords: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    leaveCount: number;
    presentPercentage: number;
    absentPercentage: number;
    latePercentage: number;
    leavePercentage: number;
  };
}

export function AttendanceStats({ stats }: AttendanceStatsProps) {
  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">إجمالي السجلات</p>
              <h3 className="text-2xl font-bold">{stats.totalRecords}</h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الحضور</p>
              <h3 className="text-2xl font-bold">{stats.presentCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.presentPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">الغياب</p>
              <h3 className="text-2xl font-bold">{stats.absentCount}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {stats.absentPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
