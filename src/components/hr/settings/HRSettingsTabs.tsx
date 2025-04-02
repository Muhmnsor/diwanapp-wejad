
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Clock, Briefcase, Award } from "lucide-react";
import { OrganizationTab } from "./OrganizationTab";
import { WorkSchedulesTab } from "./WorkSchedulesTab";

export function HRSettingsTabs() {
  return (
    <Tabs defaultValue="organization" className="space-y-4">
      <TabsList className="w-full grid grid-cols-4">
        <TabsTrigger value="organization" className="flex items-center">
          <Building2 className="ml-2 h-4 w-4" />
          الهيكل التنظيمي
        </TabsTrigger>
        <TabsTrigger value="schedules" className="flex items-center">
          <Clock className="ml-2 h-4 w-4" />
          جداول العمل
        </TabsTrigger>
        <TabsTrigger value="positions" className="flex items-center">
          <Briefcase className="ml-2 h-4 w-4" />
          المناصب والرتب
        </TabsTrigger>
        <TabsTrigger value="compensations" className="flex items-center">
          <Award className="ml-2 h-4 w-4" />
          التعويضات
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="organization" className="space-y-4">
        <OrganizationTab />
      </TabsContent>
      
      <TabsContent value="schedules" className="space-y-4">
        <WorkSchedulesTab />
      </TabsContent>
      
      <TabsContent value="positions" className="space-y-4">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">إعدادات المناصب والرتب قيد التطوير</p>
        </div>
      </TabsContent>
      
      <TabsContent value="compensations" className="space-y-4">
        <div className="p-8 text-center">
          <p className="text-muted-foreground">إعدادات التعويضات قيد التطوير</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
