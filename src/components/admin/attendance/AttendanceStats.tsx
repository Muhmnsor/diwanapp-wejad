import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

interface AttendanceStatsProps {
  registrations: any[];
}

export const AttendanceStats = ({ registrations }: AttendanceStatsProps) => {
  const totalRegistrations = registrations.length;
  const presentCount = registrations.filter(reg => 
    reg.attendance_records?.some((record: any) => record.status === 'present')
  ).length;
  const absentCount = totalRegistrations - presentCount;
  const attendanceRate = totalRegistrations > 0 
    ? ((presentCount / totalRegistrations) * 100).toFixed(1) 
    : '0';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" dir="rtl">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">إجمالي المسجلين</p>
          <h3 className="text-2xl font-bold">{totalRegistrations}</h3>
        </div>
        <Users className="h-8 w-8 text-primary" />
      </Card>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">الحضور</p>
          <h3 className="text-2xl font-bold">{presentCount}</h3>
        </div>
        <UserCheck className="h-8 w-8 text-green-500" />
      </Card>

      <Card className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">نسبة الحضور</p>
          <h3 className="text-2xl font-bold">{attendanceRate}%</h3>
        </div>
        <UserX className="h-8 w-8 text-red-500" />
      </Card>
    </div>
  );
};