
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Calendar } from "lucide-react";
import { AddAttendanceDialog } from "../dialogs/AddAttendanceDialog";
import { AttendanceTable } from "../tables/AttendanceTable";
import { LeaveBalanceTab } from "./LeaveBalanceTab";
import { LeavesManagement } from "../leaves/LeavesManagement";

export function AttendanceTab() {
  const [activeTab, setActiveTab] = useState("attendance");
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">الحضور والإجازات</h2>
        {activeTab === "attendance" && <AddAttendanceDialog />}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="attendance">سجلات الحضور</TabsTrigger>
          <TabsTrigger value="leave-balance">رصيد الإجازات</TabsTrigger>
          <TabsTrigger value="leaves">طلبات الإجازات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="attendance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-right">سجلات الحضور</CardTitle>
            </CardHeader>
            <CardContent>
              <AttendanceTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave-balance" className="mt-4">
          <LeaveBalanceTab />
        </TabsContent>
        
        <TabsContent value="leaves" className="mt-4">
          <LeavesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
