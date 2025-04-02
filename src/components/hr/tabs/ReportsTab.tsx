
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { FileText, Download, Users, Calendar, BarChart, Calendar as CalendarIcon, FileBarChart } from "lucide-react";
import { AttendanceReport } from "../reports/AttendanceReport";
import { EmployeeReport } from "../reports/EmployeeReport";
import { LeaveReport } from "../reports/LeaveReport";
import { useToast } from "@/hooks/use-toast";
import { format, subDays, subMonths } from "date-fns";
import { ar } from "date-fns/locale";

export function ReportsTab() {
  const [reportType, setReportType] = useState<string>("attendance");
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [startDate, setStartDate] = useState<Date | undefined>(subMonths(new Date(), 1)); // Default to 1 month ago
  const [endDate, setEndDate] = useState<Date | undefined>(new Date()); // Default to today
  const { toast } = useToast();

  const handleReportTypeChange = (value: string) => {
    setReportType(value);
  };
  
  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      toast({
        title: "تحديد التاريخ مطلوب",
        description: "يرجى تحديد تاريخ البداية والنهاية للتقرير",
        variant: "destructive",
      });
      return;
    }
    
    if (endDate < startDate) {
      toast({
        title: "خطأ في التاريخ",
        description: "تاريخ النهاية يجب أن يكون بعد تاريخ البداية",
        variant: "destructive",
      });
      return;
    }
    
    setActiveTab("view");
  };

  const handleQuickDateSelect = (period: string) => {
    const today = new Date();
    
    switch (period) {
      case "today":
        setStartDate(today);
        setEndDate(today);
        break;
      case "week":
        setStartDate(subDays(today, 7));
        setEndDate(today);
        break;
      case "month":
        setStartDate(subMonths(today, 1));
        setEndDate(today);
        break;
      case "quarter":
        setStartDate(subMonths(today, 3));
        setEndDate(today);
        break;
      case "year":
        setStartDate(subMonths(today, 12));
        setEndDate(today);
        break;
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4 grid w-full grid-cols-2">
          <TabsTrigger value="generate">إنشاء تقرير جديد</TabsTrigger>
          <TabsTrigger value="view">عرض التقرير</TabsTrigger>
        </TabsList>
        
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">إنشاء تقرير جديد</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="block text-sm font-medium mb-2">نوع التقرير</Label>
                  <Select value={reportType} onValueChange={handleReportTypeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التقرير" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="attendance" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        تقرير الحضور
                      </SelectItem>
                      <SelectItem value="leaves" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        تقرير الإجازات
                      </SelectItem>
                      <SelectItem value="employees" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        تقرير الموظفين
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">الفترة الزمنية</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickDateSelect("today")}
                    >
                      اليوم
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickDateSelect("week")}
                    >
                      آخر أسبوع
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickDateSelect("month")}
                    >
                      آخر شهر
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickDateSelect("quarter")}
                    >
                      آخر 3 أشهر
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickDateSelect("year")}
                    >
                      آخر سنة
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">تاريخ البداية</Label>
                  <DatePicker 
                    date={startDate} 
                    setDate={setStartDate} 
                    locale="ar" 
                    placeholder="اختر تاريخ البداية" 
                  />
                </div>
                
                <div>
                  <Label className="block text-sm font-medium mb-2">تاريخ النهاية</Label>
                  <DatePicker 
                    date={endDate} 
                    setDate={setEndDate} 
                    locale="ar" 
                    placeholder="اختر تاريخ النهاية" 
                  />
                </div>
                
                {startDate && endDate && (
                  <div className="md:col-span-2">
                    <div className="p-4 bg-muted rounded-md">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        <span>
                          سيتم إنشاء تقرير للفترة من {format(startDate, 'dd MMMM yyyy', { locale: ar })} إلى {format(endDate, 'dd MMMM yyyy', { locale: ar })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-left md:text-right mt-4">
                <Button onClick={handleGenerateReport}>
                  <BarChart className="ml-2 h-4 w-4" />
                  إنشاء التقرير
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="view" className="space-y-4">
          {reportType === "attendance" && (
            <AttendanceReport 
              startDate={startDate} 
              endDate={endDate} 
            />
          )}
          
          {reportType === "leaves" && (
            <LeaveReport 
              startDate={startDate} 
              endDate={endDate} 
            />
          )}
          
          {reportType === "employees" && (
            <EmployeeReport 
              startDate={startDate} 
              endDate={endDate} 
            />
          )}
          
        </TabsContent>
      </Tabs>
    </div>
  );
}
