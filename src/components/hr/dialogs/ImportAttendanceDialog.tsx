
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
import { Loader2, Upload, Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "@/store/refactored-auth";
import { saveAs } from 'file-saver';

export function ImportAttendanceDialog() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [errorRecords, setErrorRecords] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { user } = useAuthStore();

  const downloadTemplate = () => {
    setIsDownloading(true);
    try {
      // Create a template with sample data
      const templateData = [
        {
          employee_id: 'معرف الموظف (إلزامي)',
          attendance_date: 'تاريخ الحضور (إلزامي) - بتنسيق YYYY-MM-DD',
          check_in: 'وقت الحضور (إلزامي) - بتنسيق HH:MM',
          check_out: 'وقت الانصراف (اختياري) - بتنسيق HH:MM',
          status: 'الحالة (إلزامي) - present, absent, late, leave',
          notes: 'ملاحظات (اختياري)',
        },
        {
          employee_id: '12345',
          attendance_date: '2023-07-10',
          check_in: '08:00',
          check_out: '16:00',
          status: 'present',
          notes: 'مثال للملاحظات',
        }
      ];

      // Create a new workbook
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(templateData);
      XLSX.utils.book_append_sheet(wb, ws, "Attendance Template");

      // Save the file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'attendance_import_template.xlsx');

      toast({
        title: "تم التنزيل",
        description: "تم تنزيل نموذج ملف الإكسل بنجاح",
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تنزيل النموذج",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setRecordsCount(0);
      setErrorRecords([]);
    }
  };

  // Helper function to validate the date format
  const isValidDate = (dateString: string) => {
    // Validate YYYY-MM-DD format
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    // Check if it's a valid date
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date';
  };

  // Helper function to validate the time format
  const isValidTime = (timeString: string) => {
    // Validate HH:MM format
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return regex.test(timeString);
  };

  // Helper function to validate the status
  const isValidStatus = (status: string) => {
    return ['present', 'absent', 'late', 'leave'].includes(status);
  };

  const handleImport = async () => {
    if (!file || !user) return;
    
    setIsUploading(true);
    setErrorRecords([]);
    
    try {
      // Read the file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(fileData, { type: 'array' });
        
        // Get the first sheet
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON
        const records = XLSX.utils.sheet_to_json(sheet) as any[];
        setRecordsCount(records.length);
        
        // Validate and prepare records
        const validRecords = [];
        const errors = [];
        
        for (let i = 0; i < records.length; i++) {
          const record = records[i];
          const rowNum = i + 2; // +2 because row 1 is headers
          
          // Required fields validation
          if (!record.employee_id) {
            errors.push({ row: rowNum, error: 'معرف الموظف مطلوب', record });
            continue;
          }
          
          if (!record.attendance_date || !isValidDate(record.attendance_date)) {
            errors.push({ row: rowNum, error: 'تاريخ الحضور مطلوب وبتنسيق صحيح (YYYY-MM-DD)', record });
            continue;
          }
          
          if (!record.check_in || !isValidTime(record.check_in)) {
            errors.push({ row: rowNum, error: 'وقت الحضور مطلوب وبتنسيق صحيح (HH:MM)', record });
            continue;
          }
          
          if (record.check_out && !isValidTime(record.check_out)) {
            errors.push({ row: rowNum, error: 'وقت الانصراف يجب أن يكون بتنسيق صحيح (HH:MM)', record });
            continue;
          }
          
          if (!record.status || !isValidStatus(record.status)) {
            errors.push({ row: rowNum, error: 'الحالة مطلوبة وصحيحة (present, absent, late, leave)', record });
            continue;
          }
          
          // Format the record
          const formattedRecord = {
            employee_id: record.employee_id,
            attendance_date: record.attendance_date,
            check_in: `${record.attendance_date}T${record.check_in}:00`,
            check_out: record.check_out ? `${record.attendance_date}T${record.check_out}:00` : null,
            status: record.status,
            notes: record.notes || null,
            created_by: user.id
          };
          
          validRecords.push(formattedRecord);
        }
        
        // Save error records for display
        setErrorRecords(errors);
        
        if (errors.length > 0) {
          toast({
            title: "تحذير",
            description: `تم العثور على ${errors.length} من الأخطاء في ملف الاستيراد`,
            variant: "destructive",
          });
          setIsUploading(false);
          return;
        }
        
        // Check HR permissions
        const { data: hasAccess, error: permissionError } = await supabase
          .rpc('has_hr_access', { p_user_id: user.id });
          
        if (permissionError) {
          console.error('Error checking HR permissions:', permissionError);
          throw new Error('فشل التحقق من الصلاحيات');
        }
        
        if (!hasAccess) {
          throw new Error('ليس لديك صلاحية إضافة سجلات الحضور');
        }
        
        // Insert records
         const { data: newRecord, error } = await supabase
           .from('hr_attendance')
           .insert(validRecords);
          
        if (error) throw error;
        
        toast({
          title: "تم بنجاح",
          description: `تم استيراد ${validRecords.length} سجل حضور بنجاح`,
        });
        
        setOpen(false);
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error: any) {
      console.error('Error importing attendance records:', error);
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء استيراد سجلات الحضور",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mr-2">
          <Upload className="ml-2 h-4 w-4" />
          استيراد من إكسل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>استيراد سجلات الحضور</DialogTitle>
          <DialogDescription>
            قم باستيراد سجلات الحضور من ملف إكسل. يمكنك تنزيل نموذج الملف أدناه.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Button
            variant="outline"
            onClick={downloadTemplate}
            disabled={isDownloading}
            className="w-full"
          >
            {isDownloading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="ml-2 h-4 w-4" />
            )}
            تنزيل نموذج الملف
          </Button>

          <div className="grid gap-2">
            <Label htmlFor="file">اختر ملف الإكسل</Label>
            <Input
              id="file"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                تم اختيار: {file.name}
              </p>
            )}
          </div>
          
          {errorRecords.length > 0 && (
            <div className="border rounded-md p-3 bg-destructive/10">
              <h3 className="font-medium mb-2">أخطاء في الملف ({errorRecords.length})</h3>
              <div className="max-h-[150px] overflow-y-auto text-sm">
                {errorRecords.map((error, index) => (
                  <div key={index} className="mb-1 pb-1 border-b">
                    <span className="font-medium">الصف {error.row}:</span> {error.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            onClick={handleImport}
            disabled={!file || isUploading}
          >
            {isUploading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            استيراد
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
