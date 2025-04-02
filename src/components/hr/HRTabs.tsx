
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeesList } from "./employees/EmployeesList";
import { AttendanceManagement } from "./attendance/AttendanceManagement";
import { HRSettingsTabs } from "./settings/HRSettingsTabs";
import { Users, CalendarClock, FileBarChart, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { AttendanceTab } from "./tabs/AttendanceTab";
import { ReportsTab } from "./tabs/ReportsTab";

interface HRTabsProps {
  defaultTab?: string;
}

export function HRTabs({ defaultTab = "employees" }: HRTabsProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle tab change to update URL without page reload
  const handleTabChange = (value: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('tab', value);
    navigate(`?tab=${value}`, { replace: true });
  };

  return (
    <Tabs 
      defaultValue={defaultTab} 
      className="space-y-4" 
      dir="rtl"
      onValueChange={handleTabChange}
    >
      <TabsList className="grid grid-cols-4 w-full sm:w-auto">
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
      
      <TabsContent value="employees" className="space-y-4">
        <EmployeesList />
      </TabsContent>
      
      <TabsContent value="attendance" className="space-y-4">
        <AttendanceTab />
      </TabsContent>
      
      <TabsContent value="reports" className="space-y-4">
        <ReportsTab />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <HRSettingsTabs />
      </TabsContent>
    </Tabs>
  );
}
