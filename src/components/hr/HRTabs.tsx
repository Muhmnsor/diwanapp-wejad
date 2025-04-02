
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeesList } from "./employees/EmployeesList";
import { AttendanceManagement } from "./attendance/AttendanceManagement";
import { HRReports } from "./reports/HRReports";
import { HRSettingsTabs } from "./settings/HRSettingsTabs";
import { 
  Users, 
  CalendarClock, 
  FileBarChart, 
  Settings, 
  LayoutDashboard 
} from "lucide-react";
import { ReportsTab } from "./tabs/ReportsTab";

interface HRTabsProps {
  defaultTab?: string;
}

export function HRTabs({ defaultTab = "dashboard" }: HRTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="grid grid-cols-5 w-full sm:w-auto">
        <TabsTrigger value="dashboard" className="flex items-center gap-1">
          <LayoutDashboard className="h-4 w-4" />
          لوحة التحكم
        </TabsTrigger>
        <TabsTrigger value="employees" className="flex items-center gap-1">
          <Users className="h-4 w-4" />
          الموظفين
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex items-center gap-1">
          <CalendarClock className="h-4 w-4" />
          الحضور
        </TabsTrigger>
        <TabsTrigger value="reports" className="flex items-center gap-1">
          <FileBarChart className="h-4 w-4" />
          التقارير
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          الإعدادات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="space-y-4">
        <ReportsTab />
      </TabsContent>
      
      <TabsContent value="employees" className="space-y-4">
        <EmployeesList />
      </TabsContent>
      
      <TabsContent value="attendance" className="space-y-4">
        <AttendanceManagement />
      </TabsContent>
      
      <TabsContent value="reports" className="space-y-4">
        <HRReports />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <HRSettingsTabs />
      </TabsContent>
    </Tabs>
  );
}
