
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLeaveReport } from "@/hooks/hr/useLeaveReport";
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
import { exportLeaveReportToPdf } from "@/utils/reports/exportHRReportToPdf";
import { ExportButton } from "@/components/admin/ExportButton";
import { LeaveStats } from "./components/LeaveStats";
import { LeaveCharts } from "./components/LeaveCharts";

interface LeaveReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function LeaveReport({ startDate, endDate }: LeaveReportProps) {
  const { data, isLoading, error } = useLeaveReport(startDate, endDate);
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
          <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الإجازات</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.records.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">لا توجد طلبات إجازة في الفترة المحددة</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      approved: { label: "موافق", variant: "default" },
      rejected: { label: "مرفوض", variant: "destructive" },
      pending: { label: "قيد الانتظار", variant: "secondary" },
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Prepare data for excel export
  const exportData = data.records.map(record => ({
    الموظف: record.employee_name || 'غير محدد',
    نوع_الإجازة: record.leave_type,
    تاريخ_البداية: new Date(record.start_date).toLocaleDateString('ar-SA'),
    تاريخ_النهاية: new Date(record.end_date).toLocaleDateString('ar-SA'),
    المدة: record.duration,
    الحالة: record.status === 'approved' ? 'موافق' : 
            record.status === 'rejected' ? 'مرفوض' : 
            record.status === 'pending' ? 'قيد الانتظار' : record.status,
    السبب: record.reason || ''
  }));

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportLeaveReportToPdf(data, startDate, endDate);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">تقرير الإجازات</h2>
        
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
            filename={`تقرير_الإجازات_${startDate?.toISOString().split('T')[0]}_${endDate?.toISOString().split('T')[0]}`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <LeaveStats stats={data.stats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            رسومات بيانية للإجازات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <LeaveCharts data={data} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            سجلات الإجازات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الموظف</TableHead>
                  <TableHead>نوع الإجازة</TableHead>
                  <TableHead>تاريخ البداية</TableHead>
                  <TableHead>تاريخ النهاية</TableHead>
                  <TableHead>المدة</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>السبب</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">
                      {record.employee_name || 'غير محدد'}
                    </TableCell>
                    <TableCell>{record.leave_type}</TableCell>
                    <TableCell>
                      {new Date(record.start_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>
                      {new Date(record.end_date).toLocaleDateString('ar-SA')}
                    </TableCell>
                    <TableCell>{record.duration} يوم</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {record.reason || '-'}
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
