
import { useAttendanceRecords } from "@/hooks/hr/useAttendanceRecords";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDateWithDay, formatTime } from "@/utils/dateTimeUtils";
import { ExportButton } from "@/components/admin/ExportButton";
import { ImportAttendanceDialog } from "../dialogs/ImportAttendanceDialog";
import { ExportAttendanceDialog } from "../dialogs/ExportAttendanceDialog";
import { useHRPermissions } from "@/hooks/hr/useHRPermissions";

export function AttendanceTable() {
  const { data, isLoading, error } = useAttendanceRecords();
  const { data: permissions } = useHRPermissions();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-red-500">حدث خطأ أثناء تحميل سجلات الحضور</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">لا توجد سجلات حضور</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out entries with undefined employees to avoid "غير محدد" in the table
  const validRecords = data.filter(record => record.employees && record.employees.full_name);

  const getStatusBadge = (status: string, leftEarly: boolean, isTardy: boolean) => {
    if (leftEarly) {
      return <Badge variant="warning">مغادرة مبكرة</Badge>;
    }

    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" | "warning" }> = {
      present: { label: "حاضر", variant: "default" },
      absent: { label: "غائب", variant: "destructive" },
      late: { label: "متأخر", variant: "secondary" },
      leave: { label: "إجازة", variant: "outline" }
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Prepare data for export
  const exportData = validRecords.map(record => ({
    الموظف: record.employees?.full_name || '',
    التاريخ: formatDateWithDay(record.attendance_date),
    وقت_الحضور: formatTime(record.check_in),
    وقت_الانصراف: formatTime(record.check_out),
    الحالة: record.status === 'present' ? 'حاضر' : 
           record.status === 'absent' ? 'غائب' : 
           record.status === 'late' ? 'متأخر' : 
           record.status === 'leave' ? 'إجازة' : record.status,
    ملاحظات: record.notes || ''
  }));

  const canManageAttendance = permissions?.canManageAttendance || permissions?.isAdmin;

  console.log('Valid attendance records:', validRecords.length);
  
  return (
    <div>
      <div className="flex justify-end mb-4 gap-2">
        {canManageAttendance && <ImportAttendanceDialog />}
        <ExportAttendanceDialog />
        <ExportButton data={exportData} filename="سجلات_الحضور" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>الاسم</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>وقت الحضور</TableHead>
              <TableHead>وقت الانصراف</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>ملاحظات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {validRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.employees?.full_name || ''}
                </TableCell>
                <TableCell>
                  {formatDateWithDay(record.attendance_date)}
                </TableCell>
                <TableCell>{formatTime(record.check_in)}</TableCell>
                <TableCell>{formatTime(record.check_out)}</TableCell>
                <TableCell>
                  {getStatusBadge(record.status, record.left_early, record.is_tardy)}
                  {record.is_tardy && record.tardiness_minutes > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      تأخر {record.tardiness_minutes} دقيقة
                    </div>
                  )}
                  {record.left_early && record.early_departure_minutes > 0 && (
                    <div className="text-xs text-muted-foreground mt-1">
                      غادر قبل الموعد بـ {record.early_departure_minutes} دقيقة
                    </div>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {record.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
