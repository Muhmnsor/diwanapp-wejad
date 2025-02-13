
import { FC } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle } from "lucide-react";

interface AttendanceTableProps {
  registrations: any[];
  onAttendanceChange: (registrationId: string, status: 'present' | 'absent') => Promise<void>;
}

export const AttendanceTable: FC<AttendanceTableProps> = ({ registrations, onAttendanceChange }) => {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center">الاسم</TableHead>
            <TableHead className="text-center">رقم التسجيل</TableHead>
            <TableHead className="text-center">الحالة</TableHead>
            <TableHead className="text-center">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrations.map((registration: any) => (
            <TableRow key={registration.id}>
              <TableCell className="text-center">{registration.arabic_name}</TableCell>
              <TableCell className="text-center">{registration.registration_number}</TableCell>
              <TableCell className="text-center">
                {registration.attendance_records?.[0]?.status === 'present' ? (
                  <span className="text-green-600 flex items-center gap-1 justify-center">
                    <CheckCircle className="h-4 w-4" />
                    حاضر
                  </span>
                ) : registration.attendance_records?.[0]?.status === 'absent' ? (
                  <span className="text-red-600 flex items-center gap-1 justify-center">
                    <XCircle className="h-4 w-4" />
                    غائب
                  </span>
                ) : (
                  <span className="text-gray-500">لم يتم التحضير</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <div className="flex gap-2 justify-center">
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
