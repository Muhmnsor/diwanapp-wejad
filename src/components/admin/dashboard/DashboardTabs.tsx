
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardAppsGrid } from "./DashboardAppsGrid";
import { NotificationTester } from "@/components/notifications/NotificationTester";
import { DraftProjectTester } from "@/components/admin/dashboard/DraftProjectTester";
import { LucideIcon } from "lucide-react";

interface DashboardApp {
  title: string;
  icon: LucideIcon;
  path: string;
  description: string;
  notifications: number;
}

interface DashboardTabsProps {
  apps: DashboardApp[];
}

export const DashboardTabs = ({ apps }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="dashboard" dir="rtl" className="mb-6">
      <TabsList className="mb-4">
        <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
        <TabsTrigger value="tools">أدوات الاختبار</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="space-y-6">
        <DashboardAppsGrid apps={apps} />
      </TabsContent>
      
      <TabsContent value="tools" className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <NotificationTester />
          <DraftProjectTester />
        </div>
      </TabsContent>
    </Tabs>
  );
};
