import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Download, 
  FileText, 
  FilePdf, 
  FileSpreadsheet, 
  Printer, 
  PieChart,
  BarChart3
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const CorrespondenceReports: React.FC = () => {
  const [reportType, setReportType] = useState<string>("summary");
  const [dateRange, setDateRange] = useState<string>("month");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["incoming", "outgoing", "letter"]);
  const [includeCharts, setIncludeCharts] = useState<boolean>(true);
  const [includeDetails, setIncludeDetails] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<string>("pdf");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { toast } = useToast();

  // Handle type selection
  const handleTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedTypes(prev => [...prev, type]);
    } else {
      setSelectedTypes(prev => prev.filter(t => t !== type));
    }
  };

  // Set default date range
  const setDefaultDateRange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    let start = new Date();
    
    switch (range) {
      case 'today':
        // Just today
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'week':
        // Last 7 days
        start.setDate(today.getDate() - 7);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'month':
        // Last 30 days
        start.setDate(today.getDate() - 30);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'quarter':
        // Last 90 days
        start.setDate(today.getDate() - 90);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'year':
        // Last 365 days
        start.setDate(today.getDate() - 365);
        setStartDate(start.toISOString().split('T')[0]);
        setEndDate(today.toISOString().split('T')[0]);
        break;
      case 'custom':
        // Keep current dates
        break;
    }
  };

  // Generate report
  const generateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        variant: "destructive",
        title: "خطأ في التقرير",
        description: "يرجى تحديد نطاق تاريخ التقرير"
      });
      return;
    }

    if (selectedTypes.length === 0) {
      toast({
        variant: "destructive",
        title: "خطأ في التقرير",
        description: "يرجى تحديد نوع المعاملات على الأقل"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Fetch correspondence data
      let query = supabase
        .from('correspondence')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (selectedTypes.length < 3) {
        query = query.in('type', selectedTypes);
      }
      
      const { data: correspondenceData, error } = await query;
      
      if (error) throw error;
      
      if (!correspondenceData || correspondenceData.length === 0) {
        toast({
          variant: "destructive",
          title: "لا توجد بيانات",
          description: "لا توجد معاملات تطابق معايير التقرير المحددة"
        });
        setIsGenerating(false);
        return;
      }
      
      // Process report data (this is just a placeholder, actual implementation would depend on reporting library)
      // In a real implementation, you would:
      // 1. Process the data according to the report type
      // 2. Generate charts if includeCharts is true
      // 3. Include detailed records if includeDetails is true
      // 4. Export in the selected format
      
      console.log("Generating report with:", {
        reportType,
        dateRange,
        startDate,
        endDate,
        selectedTypes,
        includeCharts,
        includeDetails,
        exportFormat
      });
      
      // Simulate report generation
      setTimeout(() => {
        toast({
          title: "تم إنشاء التقرير",
          description: `تم إنشاء تقرير ${getReportTypeName(reportType)} بنجاح`
        });
        
        setIsGenerating(false);
        
        // Simulate download for demonstration purposes
        // In production, this would trigger a real download
        const a = document.createElement('a');
        a.href = '#';
        a.download = `تقرير_المعاملات_${new Date().toISOString().split('T')[0]}.${exportFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, 2000);
      
    } catch (err) {
      console.error("Error generating report:", err);
      toast({
        variant: "destructive",
        title: "خطأ في إنشاء التقرير",
        description: "حدث خطأ أثناء إنشاء التقرير، يرجى المحاولة مرة أخرى"
      });
      setIsGenerating(false);
    }
  };

  // Helper function to get report type name
  const getReportTypeName = (type: string) => {
    switch (type) {
      case 'summary':
        return 'ملخص المعاملات';
      case 'status':
        return 'حالة المعاملات';
      case 'performance':
        return 'أداء المعاملات';
      case 'distribution':
        return 'توزيع المعاملات';
      default:
        return 'المعاملات';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>إنشاء تقرير</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* نوع التقرير */}
          <div>
            <Label>نوع التقرير</Label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <Button 
                type="button" 
                variant={reportType === "summary" ? "default" : "outline"} 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => setReportType("summary")}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>ملخص المعاملات</span>
              </Button>
              <Button 
                type="button" 
                variant={reportType === "status" ? "default" : "outline"} 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => setReportType("status")}
              >
                <PieChart className="h-6 w-6 mb-2" />
                <span>حالة المعاملات</span>
              </Button>
              <Button 
                type="button" 
                variant={reportType === "performance" ? "default" : "outline"} 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => setReportType("performance")}
              >
                <BarChart3 className="h-6 w-6 mb-2" />
                <span>أداء المعاملات</span>
              </Button>
              <Button 
                type="button" 
                variant={reportType === "distribution" ? "default" : "outline"} 
                className="h-auto py-4 flex flex-col items-center justify-center"
                onClick={() => setReportType("distribution")}
              >
                <FilePdf className="h-6 w-6 mb-2" />
                <span>توزيع المعاملات</span>
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* نطاق التاريخ */}
          <div>
            <Label>نطاق التاريخ</Label>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mt-2">
              <Button 
                type="button" 
                variant={dateRange === "today" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("today")}
              >
                اليوم
              </Button>
              <Button 
                type="button" 
                variant={dateRange === "week" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("week")}
              >
                أسبوع
              </Button>
              <Button 
                type="button" 
                variant={dateRange === "month" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("month")}
              >
                شهر
              </Button>
              <Button 
                type="button" 
                variant={dateRange === "quarter" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("quarter")}
              >
                ربع سنة
              </Button>
              <Button 
                type="button" 
                variant={dateRange === "year" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("year")}
              >
                سنة
              </Button>
              <Button 
                type="button" 
                variant={dateRange === "custom" ? "default" : "outline"} 
                size="sm"
                onClick={() => setDefaultDateRange("custom")}
              >
                مخصص
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <Label htmlFor="start-date">تاريخ البداية</Label>
                <Input 
                  id="start-date" 
                  type="date" 
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="end-date">تاريخ النهاية</Label>
                <Input 
                  id="end-date" 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* نوع المعاملات */}
          <div>
            <Label>نوع المعاملات</Label>
            <div className="flex flex-col md:flex-row gap-4 mt-2">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="incoming" 
                  checked={selectedTypes.includes("incoming")}
                  onCheckedChange={checked => handleTypeChange("incoming", checked === true)}
                />
                <Label htmlFor="incoming">الوارد</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="outgoing" 
                  checked={selectedTypes.includes("outgoing")}
                  onCheckedChange={checked => handleTypeChange("outgoing", checked === true)}
                />
                <Label htmlFor="outgoing">الصادر</Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox 
                  id="letter" 
                  checked={selectedTypes.includes("letter")}
                  onCheckedChange={checked => handleTypeChange("letter", checked === true)}
                />
                <Label htmlFor="letter">الخطابات</Label>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* خيارات التقرير */}
          <div>
            <Label>خيارات التقرير</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex items-center justify-between border p-3 rounded-md">
                <Label htmlFor="include-charts">تضمين الرسوم البيانية</Label>
                <Switch 
                  id="include-charts" 
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
              </div>
              <div className="flex items-center justify-between border p-3 rounded-md">
                <Label htmlFor="include-details">تضمين التفاصيل الكاملة</Label>
                <Switch 
                  id="include-details" 
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* صيغة التصدير */}
          <div>
            <Label htmlFor="export-format">صيغة التصدير</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger id="export-format">
                <SelectValue placeholder="اختر صيغة التصدير" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center">
                    <FilePdf className="h-4 w-4 ml-2" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="xlsx">
                  <div className="flex items-center">
                    <FileSpreadsheet className="h-4 w-4 ml-2" />
                    <span>Excel</span>
                  </div>
                </SelectItem>
                <SelectItem value="print">
                  <div className="flex items-center">
                    <Printer className="h-4 w-4 ml-2" />
                    <span>طباعة مباشرة</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* زر إنشاء التقرير */}
          <div className="flex justify-end mt-6">
            <Button 
              onClick={generateReport} 
              disabled={isGenerating}
              className="min-w-[150px]"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 ml-1" />
                  إنشاء التقرير
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

