import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

interface AttendanceTableProps {
  registrations: any[];
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
  mode?: 'activity' | 'registrant';
}

export const AttendanceTable: FC<AttendanceTableProps> = ({ 
  registrations, 
  onAttendanceChange,
  mode = 'activity'
}) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">
              {mode === 'activity' ? 'الاسم' : 'النشاط'}
            </TableHead>
            <TableHead className="text-right">رقم التسجيل</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration: any) => (
            <TableRow key={registration.id}>
              <TableCell className="text-right">
                {mode === 'activity' ? registration.name : registration.title}
              </TableCell>
              <TableCell className="text-right">{registration.registration_number}</TableCell>
              <TableCell className="text-right">
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
              <TableCell className="text-right">
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
          ))}
        </TableBody>
      </Table>
    </div>
  );
};