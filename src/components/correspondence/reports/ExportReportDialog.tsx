import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import {
  FileText,
  FileSpreadsheet,
  FilePdf,
  Download,
  FilePlus,
  Printer
} from "lucide-react";
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ExportReportDialogProps {
  onExport: (format: string, data: any) => void;
  reportData: any;
  reportTitle: string;
  trigger?: React.ReactNode;
}

export const ExportReportDialog: React.FC<ExportReportDialogProps> = ({
  onExport,
  reportData,
  reportTitle,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState("pdf");
  const [options, setOptions] = useState({
    includeCharts: true,
    includeStatistics: true,
    includeDetails: true,
    landscape: false
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const handleExport = async () => {
    setIsProcessing(true);
    
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${reportTitle || 'تقرير'}_${timestamp}`;
      
      switch (format) {
        case 'pdf':
          await exportToPdf(filename);
          break;
        case 'excel':
          await exportToExcel(filename);
          break;
        case 'print':
          await printReport();
          break;
        default:
          break;
      }
      
      setOpen(false);
      toast({
        title: "تم تصدير التقرير بنجاح",
        description: `تم تصدير التقرير بتنسيق ${getFormatName(format)}`,
      });
      
      // إشعار المكون الأب بعملية التصدير
      onExport(format, {
        data: reportData,
        options
      });
      
    } catch (error) {
      console.error("Error exporting report:", error);
      toast({
        variant: "destructive",
        title: "خطأ أثناء تصدير التقرير",
        description: "حدث خطأ أثناء تصدير التقرير، يرجى المحاولة مرة أخرى.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const exportToPdf = async (filename: string) => {
    // إنشاء ملف PDF
    const doc = new jsPDF({
      orientation: options.landscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // إضافة الخط العربي للـ PDF
    // doc.addFont('path/to/arabic-font.ttf', 'Arabic', 'normal');
    // doc.setFont('Arabic');
    
    // إضافة العنوان
    doc.setFontSize(18);
    doc.text(reportTitle, doc.internal.pageSize.getWidth() / 2, 15, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`, doc.internal.pageSize.getWidth() / 2, 25, { align: 'center' });
    
    let yPosition = 35;
    
    // إضافة الإحصائيات إذا تم اختيارها
    if (options.includeStatistics && reportData.statistics) {
      doc.setFontSize(14);
      doc.text('الإحصائيات', 15, yPosition);
      yPosition += 10;
      
      doc.setFontSize(10);
      Object.entries(reportData.statistics).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPosition);
        yPosition += 7;
      });
      
      yPosition += 10;
    }
    
    // إضافة التفاصيل إذا تم اختيارها
    if (options.includeDetails && reportData.items && reportData.items.length) {
      doc.setFontSize(14);
      doc.text('تفاصيل المعاملات', 15, yPosition);
      yPosition += 10;
      
      // إعداد الجدول
      const tableData = reportData.items.map((item) => [
        item.id || '',
        item.subject || '',
        item.type || '',
        item.status || '',
        item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '',
        item.sender || '',
        item.recipient || ''
      ]);
      
      const tableHeaders = [
        ['الرقم', 'الموضوع', 'النوع', 'الحالة', 'التاريخ', 'المرسل', 'المستلم']
      ];
      
      // إنشاء الجدول
      doc.autoTable({
        head: tableHeaders,
        body: tableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185], textColor: 255 },
        styles: { font: 'Arabic', halign: 'right', direction: 'rtl' }
      });
    }
    
    // تنزيل الملف
    doc.save(`${filename}.pdf`);
  };

  const exportToExcel = async (filename: string) => {
    // إعداد بيانات الإكسل
    let worksheetData = [];
    
    // إضافة العنوان
    worksheetData.push([reportTitle]);
    worksheetData.push([`تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}`]);
    worksheetData.push([]);
    
    // إضافة الإحصائيات إذا تم اختيارها
    if (options.includeStatistics && reportData.statistics) {
      worksheetData.push(['الإحصائيات']);
      Object.entries(reportData.statistics).forEach(([key, value]) => {
        worksheetData.push([key, value]);
      });
      worksheetData.push([]);
    }
    
    // إضافة التفاصيل إذا تم اختيارها
    if (options.includeDetails && reportData.items && reportData.items.length) {
      worksheetData.push(['تفاصيل المعاملات']);
      
      // إضافة رؤوس الجدول
      worksheetData.push(['الرقم', 'الموضوع', 'النوع', 'الحالة', 'التاريخ', 'المرسل', 'المستلم']);
      
      // إضافة بيانات الجدول
      reportData.items.forEach((item) => {
        worksheetData.push([
          item.id || '',
          item.subject || '',
          item.type || '',
          item.status || '',
          item.date ? new Date(item.date).toLocaleDateString('ar-SA') : '',
          item.sender || '',
          item.recipient || ''
        ]);
      });
    }
    
    // إنشاء مصنّف وورقة عمل
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    
    // إضافة ورقة العمل إلى المصنّف
    XLSX.utils.book_append_sheet(workbook, worksheet, 'تقرير المعاملات');
    
    // تنزيل الملف
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const printReport = async () => {
    // إنشاء نافذة طباعة جديدة
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('لم نتمكن من فتح نافذة الطباعة. يرجى التأكد من السماح بالنوافذ المنبثقة.');
    }
    
    // إعداد محتوى HTML للطباعة
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <title>${reportTitle}</title>
        <meta charset="utf-8">
        <style>
          body {
            font-family: Arial, Tahoma, sans-serif;
            margin: 20px;
            direction: rtl;
          }
          h1, h2, h3 {
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table, th, td {
            border: 1px solid #ddd;
          }
          th, td {
            padding: 8px;
            text-align: right;
          }
          th {
            background-color: #f2f2f2;
          }
          .statistics {
            margin: 20px 0;
          }
          .statistics div {
            margin: 5px 0;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button onclick="window.print();">طباعة التقرير</button>
          <button onclick="window.close();">إغلاق</button>
        </div>
        
        <h1>${reportTitle}</h1>
        <h3>تاريخ التقرير: ${new Date().toLocaleDateString('ar-SA')}</h3>
        
        ${options.includeStatistics && reportData.statistics ? `
          <h2>الإحصائيات</h2>
          <div class="statistics">
            ${Object.entries(reportData.statistics).map(([key, value]) => `
              <div><strong>${key}:</strong> ${value}</div>
            `).join('')}
          </div>
        ` : ''}
        
        ${options.includeDetails && reportData.items && reportData.items.length ? `
          <h2>تفاصيل المعاملات</h2>
          <table>
            <thead>
              <tr>
                <th>الرقم</th>
                <th>الموضوع</th>
                <th>النوع</th>
                <th>الحالة</th>
                <th>التاريخ</th>
                <th>المرسل</th>
                <th>المستلم</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.items.map(item => `
                <tr>
                  <td>${item.id || ''}</td>
                  <td>${item.subject || ''}</td>
                  <td>${item.type || ''}</td>
                  <td>${item.status || ''}</td>
                  <td>${item.date ? new Date(item.date).toLocaleDateString('ar-SA') : ''}</td>
                  <td>${item.sender || ''}</td>
                  <td>${item.recipient || ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : ''}
      </body>
      </html>
    `;
    
    // كتابة المحتوى في نافذة الطباعة
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // طباعة المحتوى بعد تحميل النافذة
    printWindow.onload = function() {
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    };
  };

  const getFormatName = (format: string) => {
    switch (format) {
      case 'pdf':
        return 'PDF';
      case 'excel':
        return 'Excel';
      case 'print':
        return 'طباعة';
      default:
        return 'غير معروف';
    }
  };

  const handleOptionChange = (option: keyof typeof options, value: boolean) => {
    setOptions(prev => ({ ...prev, [option]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Download className="ml-2 h-4 w-4" />
            تصدير التقرير
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>تصدير التقرير</DialogTitle>
          <DialogDescription>
            اختر تنسيق التصدير والخيارات المطلوبة
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>تنسيق التصدير</Label>
            <RadioGroup 
              value={format} 
              onValueChange={setFormat}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="pdf" id="pdf" />
                <Label htmlFor="pdf" className="flex items-center">
                  <FilePdf className="ml-2 h-4 w-4 text-red-500" />
                  تصدير كملف PDF
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel" className="flex items-center">
                  <FileSpreadsheet className="ml-2 h-4 w-4 text-green-600" />
                  تصدير كملف Excel
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <RadioGroupItem value="print" id="print" />
                <Label htmlFor="print" className="flex items-center">
                  <Printer className="ml-2 h-4 w-4 text-blue-600" />
                  طباعة مباشرة
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label>خيارات التقرير</Label>
            <div className="flex flex-col space-y-1.5">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="includeStatistics" 
                  checked={options.includeStatistics} 
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeStatistics', checked === true)
                  } 
                />
                <Label htmlFor="includeStatistics">تضمين الإحصائيات</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="includeDetails" 
                  checked={options.includeDetails} 
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeDetails', checked === true)
                  } 
                />
                <Label htmlFor="includeDetails">تضمين تفاصيل المعاملات</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="includeCharts" 
                  checked={options.includeCharts} 
                  onCheckedChange={(checked) => 
                    handleOptionChange('includeCharts', checked === true)
                  } 
                />
                <Label htmlFor="includeCharts">تضمين الرسوم البيانية</Label>
              </div>
              {format === 'pdf' && (
                <div className="flex items-center space-x-2 space-x-reverse mt-2">
                  <Checkbox 
                    id="landscape" 
                    checked={options.landscape} 
                    onCheckedChange={(checked) => 
                      handleOptionChange('landscape', checked === true)
                    } 
                  />
                  <Label htmlFor="landscape">تنسيق أفقي</Label>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter className="justify-between sm:justify-between">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button onClick={handleExport} disabled={isProcessing}>
            {isProcessing ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="ml-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

