
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { FileText, Download, Users, Calendar, BarChart } from "lucide-react";
import { AttendanceReport } from "../reports/AttendanceReport";
import { EmployeeReport } from "../reports/EmployeeReport";
import { LeaveReport } from "../reports/LeaveReport";
import { useToast } from "@/hooks/use-toast";

export function ReportsTab() {
  const [reportType, setReportType] = useState<string>("attendance");
  const [activeTab, setActiveTab] = useState<string>("generate");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
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
                      <SelectItem value="attendance" className="flex items-center">
                        <Calendar className="ml-2 h-4 w-4" />
                        <span>تقرير الحضور</span>
                      </SelectItem>
                      <SelectItem value="leaves" className="flex items-center">
                        <Calendar className="ml-2 h-4 w-4" />
                        <span>تقرير الإجازات</span>
                      </SelectItem>
                      <SelectItem value="employees" className="flex items-center">
                        <Users className="ml-2 h-4 w-4" />
                        <span>تقرير الموظفين</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div></div>
                
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
