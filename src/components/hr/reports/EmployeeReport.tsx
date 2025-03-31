
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployeeReport } from "@/hooks/hr/useEmployeeReport";
import { Button } from "@/components/ui/button";
import { FileText, Loader2 } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportEmployeeReportToPdf } from "@/utils/reports/exportHRReportToPdf";
import { ExportButton } from "@/components/admin/ExportButton";
import { EmployeeStats } from "./components/EmployeeStats";
import { EmployeeCharts } from "./components/EmployeeCharts";

interface EmployeeReportProps {
  startDate?: Date;
  endDate?: Date;
}

export function EmployeeReport({ startDate, endDate }: EmployeeReportProps) {
  const { data, isLoading, error } = useEmployeeReport(startDate, endDate);
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
          <p className="text-red-500">حدث خطأ أثناء تحميل بيانات الموظفين</p>
          <p className="text-sm text-muted-foreground">{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.employees.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">لا توجد بيانات موظفين في الفترة المحددة</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "outline" | "secondary" }> = {
      active: { label: "نشط", variant: "default" },
      inactive: { label: "غير نشط", variant: "destructive" },
      vacation: { label: "إجازة", variant: "secondary" },
      terminated: { label: "منتهي", variant: "outline" },
    };

    const { label, variant } = statusMap[status] || { label: status, variant: "outline" };
    return <Badge variant={variant}>{label}</Badge>;
  };

  // Prepare data for excel export
  const exportData = data.employees.map(emp => ({
    الاسم: emp.full_name,
    القسم: emp.department || '-',
    المنصب: emp.position || '-',
    تاريخ_التعيين: emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('ar-SA') : '-',
    البريد_الإلكتروني: emp.email || '-',
    الهاتف: emp.phone || '-',
    الحالة: emp.status === 'active' ? 'نشط' : 
            emp.status === 'inactive' ? 'غير نشط' : 
            emp.status === 'vacation' ? 'إجازة' :
            emp.status === 'terminated' ? 'منتهي' : emp.status || '-',
    نوع_العقد: emp.contract_type || '-'
  }));

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportEmployeeReportToPdf(data, startDate, endDate);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold">تقرير الموظفين</h2>
        
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
            filename={`تقرير_الموظفين`} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EmployeeStats stats={data.stats} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            رسومات بيانية للموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <EmployeeCharts data={data} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-right">
            قائمة الموظفين
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>القسم</TableHead>
                  <TableHead>المنصب</TableHead>
                  <TableHead>تاريخ التعيين</TableHead>
                  <TableHead>نوع العقد</TableHead>
                  <TableHead>الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.employees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">
                      {employee.full_name}
                    </TableCell>
                    <TableCell>{employee.department || '-'}</TableCell>
                    <TableCell>{employee.position || '-'}</TableCell>
                    <TableCell>
                      {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('ar-SA') : '-'}
                    </TableCell>
                    <TableCell>{employee.contract_type || '-'}</TableCell>
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
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
