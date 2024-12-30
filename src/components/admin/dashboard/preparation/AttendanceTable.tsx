import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AttendanceTableProps {
  registrations: any[];
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
  totalActivities: number;
}

export const AttendanceTable: FC<AttendanceTableProps> = ({ 
  registrations, 
  onAttendanceChange,
  totalActivities 
}) => {
  const calculateAttendanceStats = (registration: any) => {
    if (!registration.attendance_records) {
      return { attended: 0, percentage: 0 };
    }

    const attendedActivities = new Set(
      registration.attendance_records
        .filter(record => record.status === 'present')
        .map(record => record.activity_id)
    ).size;

    const percentage = totalActivities > 0 
      ? Math.round((attendedActivities / totalActivities) * 100) 
      : 0;

    return {
      attended: attendedActivities,
      percentage
    };
  };

  const getAttendanceStatus = (registration: any) => {
    const currentRecord = registration.attendance_records?.[0];
    
    if (!currentRecord) {
      return { status: 'not_recorded', display: 'لم يتم التحضير' };
    }

    if (currentRecord.status === 'present') {
      return { status: 'present', display: 'حاضر' };
    }

    if (currentRecord.status === 'absent') {
      return { status: 'absent', display: 'غائب' };
    }

    return { status: 'not_recorded', display: 'لم يتم التحضير' };
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">إحصائيات الحضور</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration: any) => {
            const stats = calculateAttendanceStats(registration);
            const attendanceStatus = getAttendanceStatus(registration);
            
            return (
              <TableRow key={registration.id}>
                <TableCell>{registration.name}</TableCell>
                <TableCell>
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      حضر {stats.attended} من {totalActivities} نشاط
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={stats.percentage} className="h-2" />
                      <span className="text-sm font-medium">{stats.percentage}%</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {attendanceStatus.status === 'present' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      حاضر
                    </span>
                  ) : attendanceStatus.status === 'absent' ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      غائب
                    </span>
                  ) : (
                    <span className="text-gray-500">لم يتم التحضير</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600"
                      onClick={() => onAttendanceChange(registration.id, 'present')}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600"
                      onClick={() => onAttendanceChange(registration.id, 'absent')}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};