import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

interface AttendanceTableProps {
  registrations: any[];
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
}

export const AttendanceTable: FC<AttendanceTableProps> = ({ registrations, onAttendanceChange }) => {
  const calculateAttendanceStats = (registration: any) => {
    if (!registration.attendance_records) return { count: 0, percentage: 0 };
    
    const presentCount = registration.attendance_records.filter(
      (record: any) => record.status === 'present'
    ).length;
    
    const totalActivities = registration.total_activities || 1;
    const percentage = (presentCount / totalActivities) * 100;
    
    return {
      count: presentCount,
      percentage: Math.round(percentage)
    };
  };

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">الاسم</TableHead>
            <TableHead className="text-right">رقم التسجيل</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">نسبة الحضور</TableHead>
            <TableHead className="text-right">عدد مرات الحضور</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration: any) => {
            const stats = calculateAttendanceStats(registration);
            return (
              <TableRow key={registration.id}>
                <TableCell>{registration.name}</TableCell>
                <TableCell>{registration.registration_number}</TableCell>
                <TableCell>
                  {registration.attendance_records?.[0]?.status === 'present' ? (
                    <span className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      حاضر
                    </span>
                  ) : registration.attendance_records?.[0]?.status === 'absent' ? (
                    <span className="text-red-600 flex items-center gap-1">
                      <XCircle className="h-4 w-4" />
                      غائب
                    </span>
                  ) : (
                    <span className="text-gray-500">لم يتم التحضير</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-primary h-2.5 rounded-full" 
                        style={{ width: `${stats.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{stats.percentage}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {stats.count} من {registration.total_activities || 0} نشاط
                  </span>
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