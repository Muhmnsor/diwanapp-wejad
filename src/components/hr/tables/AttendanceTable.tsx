
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

export function AttendanceTable() {
  const { data, isLoading, error } = useAttendanceRecords();

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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      present: { label: "حاضر", variant: "default" },
      absent: { label: "غائب", variant: "destructive" },
      late: { label: "متأخر", variant: "secondary" },
      leave: { label: "إجازة", variant: "outline" }
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "default" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
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
          {data.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                {record.employees?.name || 'غير محدد'}
              </TableCell>
              <TableCell>
                {new Date(record.attendance_date).toLocaleDateString('ar-SA')}
              </TableCell>
              <TableCell>{record.time_in}</TableCell>
              <TableCell>{record.time_out || '-'}</TableCell>
              <TableCell>{getStatusBadge(record.status)}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {record.notes || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
