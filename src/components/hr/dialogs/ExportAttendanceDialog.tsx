
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDateWithDay } from "@/utils/dateTimeUtils";

export function ExportAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exportType, setExportType] = useState("all");
  const [employeeId, setEmployeeId] = useState("");
  const [employees, setEmployees] = useState<any[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  // Load employees on dialog open
  const loadEmployees = async () => {
    if (employees.length > 0) return;
    
    setIsLoadingEmployees(true);
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name')
        .order('full_name');
        
      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.error('Error loading employees:', error);
    } finally {
      setIsLoadingEmployees(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      loadEmployees();
      
      // Set default date range to current month
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    }
  };

  // Format time from timestamp
  const formatTime = (timestamp: string | null) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timestamp;
    }
  };

  const getStatusInArabic = (status: string) => {
    const statusMap: Record<string, string> = {
      present: "حاضر",
      absent: "غائب",
      late: "متأخر",
      leave: "إجازة"
    };
    return statusMap[status] || status;
  };

  const exportAttendance = async () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "تنبيه",
        description: "يرجى تحديد نطاق التاريخ للتصدير",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      // Build query
      let query = supabase
        .from('hr_attendance')
        .select(`
          *,
          employees:employee_id (
            full_name,
            position,
            department
          )
        `)
        .gte('attendance_date', dateFrom)
        .lte('attendance_date', dateTo)
        .order('attendance_date', { ascending: false });
        
      // Apply employee filter if selected
      if (exportType === 'employee' && employeeId) {
        query = query.eq('employee_id', employeeId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast({
          title: "تنبيه",
          description: "لا توجد بيانات للتصدير في النطاق المحدد",
          variant: "destructive",
        });
        setIsExporting(false);
        return;
      }
      
      // Format data for export
      const formattedData = data.map(record => ({
        'الموظف': record.employees?.full_name || 'غير محدد',
        'المسمى الوظيفي': record.employees?.position || '-',
        'القسم': record.employees?.department || '-',
        'التاريخ': formatDateWithDay(record.attendance_date),
        'وقت الحضور': formatTime(record.check_in),
        'وقت الانصراف': formatTime(record.check_out),
        'الحالة': getStatusInArabic(record.status),
        'ملاحظات': record.notes || ''
      }));
      
      // Create workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(formattedData);
      
      // Set column widths
      const colWidths = [
        { wch: 20 }, // الموظف
        { wch: 15 }, // المسمى الوظيفي
        { wch: 15 }, // القسم
        { wch: 15 }, // التاريخ
        { wch: 12 }, // وقت الحضور
        { wch: 12 }, // وقت الانصراف
        { wch: 10 }, // الحالة
        { wch: 25 }  // ملاحظات
      ];
      ws['!cols'] = colWidths;
      
      XLSX.utils.book_append_sheet(wb, ws, "سجلات الحضور");
      
      // Generate filename with date range
      const fromDateFormatted = new Date(dateFrom).toLocaleDateString('ar-SA');
      const toDateFormatted = new Date(dateTo).toLocaleDateString('ar-SA');
      const fileName = `سجلات_الحضور_${fromDateFormatted}_الى_${toDateFormatted}.xlsx`;
      
      // Export the file
      XLSX.writeFile(wb, fileName);
      
      toast({
        title: "تم بنجاح",
        description: `تم تصدير ${formattedData.length} سجل حضور بنجاح`,
      });
      
      setOpen(false);
    } catch (error: any) {
      console.error('Error exporting attendance:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء تصدير سجلات الحضور",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Download className="ml-2 h-4 w-4" />
          تصدير الحضور
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تصدير سجلات الحضور</DialogTitle>
          <DialogDescription>
            اختر نطاق التاريخ وخيارات التصدير
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="date-from">من تاريخ</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date-to">إلى تاريخ</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="export-type">نوع التصدير</Label>
            <Select value={exportType} onValueChange={setExportType}>
              <SelectTrigger id="export-type">
                <SelectValue placeholder="اختر نوع التصدير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل السجلات</SelectItem>
                <SelectItem value="employee">موظف محدد</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {exportType === 'employee' && (
            <div className="grid gap-2">
              <Label htmlFor="employee">الموظف</Label>
              <Select value={employeeId} onValueChange={setEmployeeId}>
                <SelectTrigger id="employee">
                  <SelectValue placeholder="اختر الموظف" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingEmployees ? (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={exportAttendance}
            disabled={isExporting || !dateFrom || !dateTo || (exportType === 'employee' && !employeeId)}
          >
            {isExporting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            تصدير
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
