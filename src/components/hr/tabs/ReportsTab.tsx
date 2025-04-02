
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReport } from "../reports/AttendanceReport";
import { EmployeeReport } from "../reports/EmployeeReport";
import { LeaveReport } from "../reports/LeaveReport";
import { EmployeeSelector } from "../reports/components/EmployeeSelector";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export function ReportsTab() {
  const [activeTab, setActiveTab] = useState("attendance");
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(undefined);

  const handleExportReport = () => {
    if (!dateRange) {
      toast.error("يرجى تحديد نطاق تاريخ للتقرير");
      return;
    }
    
    const reportName = activeTab === "attendance" 
      ? "تقرير الحضور" 
      : activeTab === "employees" 
        ? "تقرير الموظفين" 
        : "تقرير الإجازات";
    
    toast.success(`تم تصدير ${reportName} بنجاح`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                placeholder="حدد فترة التقرير"
                align="right"
                locale="ar"
              />
              
              <EmployeeSelector 
                value={selectedEmployeeId} 
                onChange={setSelectedEmployeeId} 
              />
            </div>
            
            <Button
              onClick={handleExportReport}
              variant="outline"
              disabled={!dateRange}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير التقرير
            </Button>
          </div>
          
          <Tabs defaultValue="attendance" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="attendance">تقارير الحضور</TabsTrigger>
              <TabsTrigger value="employees">تقارير الموظفين</TabsTrigger>
              <TabsTrigger value="leaves">تقارير الإجازات</TabsTrigger>
            </TabsList>
            
            <TabsContent value="attendance" className="space-y-4">
              {dateRange ? (
                <AttendanceReport 
                  startDate={dateRange.from} 
                  endDate={dateRange.to}
                  employeeId={selectedEmployeeId}
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center bg-muted rounded-lg">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">يرجى تحديد فترة التقرير</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    حدد تاريخ البداية والنهاية لعرض تقرير الحضور
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="employees" className="space-y-4">
              {dateRange ? (
                <EmployeeReport 
                  startDate={dateRange.from} 
                  endDate={dateRange.to} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center bg-muted rounded-lg">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">يرجى تحديد فترة التقرير</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    حدد تاريخ البداية والنهاية لعرض تقرير الموظفين
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="leaves" className="space-y-4">
              {dateRange ? (
                <LeaveReport 
                  startDate={dateRange.from} 
                  endDate={dateRange.to} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center bg-muted rounded-lg">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">يرجى تحديد فترة التقرير</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    حدد تاريخ البداية والنهاية لعرض تقرير الإجازات
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
