
import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkScheduleManagement } from "../schedule/WorkScheduleManagement";
import { LeaveTypesManagement } from "../leaves/LeaveTypesManagement";
import { AttendanceSettings } from "./AttendanceSettings";
import { OrganizationalStructureManagement } from "../organization/OrganizationalStructureManagement";
import { Settings, Clock, FileText, Briefcase, CalendarCheck, Building2 } from "lucide-react";

interface HRSettingsTabsProps {
  defaultTab?: string;
}

export function HRSettingsTabs({ defaultTab = "schedules" }: HRSettingsTabsProps) {
  return (
    <Tabs defaultValue={defaultTab} className="space-y-4">
      <TabsList className="grid grid-cols-5 max-w-md">
        <TabsTrigger value="schedules" className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          جداول العمل
        </TabsTrigger>
        <TabsTrigger value="leave" className="flex items-center gap-1">
          <CalendarCheck className="h-4 w-4" />
          الإجازات
        </TabsTrigger>
        <TabsTrigger value="attendance" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          الحضور
        </TabsTrigger>
        <TabsTrigger value="organization" className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          الهيكل التنظيمي
        </TabsTrigger>
        <TabsTrigger value="settings" className="flex items-center gap-1">
          <Settings className="h-4 w-4" />
          الإعدادات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="schedules" className="space-y-4">
        <WorkScheduleManagement />
      </TabsContent>
      
      <TabsContent value="leave" className="space-y-4">
        <LeaveTypesManagement />
      </TabsContent>
      
      <TabsContent value="attendance" className="space-y-4">
        <AttendanceSettings />
      </TabsContent>
      
      <TabsContent value="organization" className="space-y-4">
        <OrganizationalStructureManagement />
      </TabsContent>
      
      <TabsContent value="settings" className="space-y-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">الإعدادات العامة - قيد التطوير</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
