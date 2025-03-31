
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAttendanceReport } from "@/hooks/hr/useAttendanceReport";
import { Button } from "@/components/ui/button";
import { DownloadIcon, FileText, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportAttendanceReportToPdf } from "@/utils/reports/exportHRReportToPdf";
import { ExportButton } from "@/components/admin/ExportButton";
import { formatDateWithDay } from "@/utils/dateTimeUtils";
import { AttendanceStats } from "./components/AttendanceStats";
import { AttendanceCharts } from "./components/AttendanceCharts";

interface AttendanceReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function AttendanceReport({ startDate, endDate }: AttendanceReportProps) {
  const { data, isLoading, error } = useAttendanceReport(startDate, endDate);
  const [exportingPdf, setExportingPdf] = useState(false);
  
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
          <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الحضور</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.records.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">لا توجد بيانات حضور في الفترة المحددة</p>
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

  // Prepare data for excel export
  const exportData = data.records.map(record => ({
    الموظف: record.employee_name || 'غير محدد',
    التاريخ: formatDateWithDay(record.attendance_date),
    وقت_الحضور: record.check_in ? new Date(record.check_in).toLocaleTimeString('ar-SA') : '-',
    وقت_الانصراف: record.check_out ? new Date(record.check_out).toLocaleTimeString('ar-SA') : '-',
    الحالة: record.status === 'present' ? 'حاضر' : 
           record.status === 'absent' ? 'غائب' : 
           record.status === 'late' ? 'متأخر' : 
           record.status === 'leave' ? 'إجازة' : record.status,
    ملاحظات: record.notes || ''
  }));

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportAttendanceReportToPdf(data, startDate, endDate);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">تقرير الحضور</h2>
        
        <div className="flex space-x-2 space-x-reverse">
          <Button 
            variant="outline" 
            onClick={handleExportPdf}
            disabled={exportingPdf}
          >
            {exportingPdf ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <FileText className="ml-2 h-4 w-4" />
            )}
            تصدير PDF
          </Button>
          
          <ExportButton 
            data={exportData} 
            filename={`تقرير_الحضور_${startDate?.toISOString().split('T')[0]}_${endDate?.toISOString().split('T')[0]}`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AttendanceStats stats={data.stats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            رسومات بيانية للحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <AttendanceCharts data={data} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            سجلات الحضور
          </CardTitle>
        </CardHeader>
        <CardContent>
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
                {data.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employee_name || 'غير محدد'}
                    </TableCell>
                    <TableCell>
                      {formatDateWithDay(record.attendance_date)}
                    </TableCell>
                    <TableCell>
                      {record.check_in 
                        ? new Date(record.check_in).toLocaleTimeString('ar-SA') 
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {record.check_out 
                        ? new Date(record.check_out).toLocaleTimeString('ar-SA') 
                        : '-'}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.notes || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
