
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AttendanceReport } from "./AttendanceReport";
import { EmployeeReport } from "./EmployeeReport";
import { LeaveReport } from "./LeaveReport";
import { Card } from "@/components/ui/card";

export function HRReports() {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <Tabs defaultValue="attendance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="attendance">تقارير الحضور</TabsTrigger>
            <TabsTrigger value="employees">تقارير الموظفين</TabsTrigger>
            <TabsTrigger value="leaves">تقارير الإجازات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attendance" className="space-y-4">
            <AttendanceReport />
          </TabsContent>
          
          <TabsContent value="employees" className="space-y-4">
            <EmployeeReport />
          </TabsContent>
          
          <TabsContent value="leaves" className="space-y-4">
            <LeaveReport />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
