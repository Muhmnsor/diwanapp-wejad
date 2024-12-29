import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types/project";
import { EventDashboard } from "@/components/admin/EventDashboard";

interface ProjectAdminTabsProps {
  project: Project;
  isAdmin: boolean;
  id: string;
}

export const ProjectAdminTabs = ({
  id,
  isAdmin,
}: ProjectAdminTabsProps) => {
  console.log('ProjectAdminTabs - isAdmin:', isAdmin);

  if (!isAdmin) return null;

  return (
    <Tabs defaultValue="dashboard" className="w-full" dir="rtl">
      <TabsList className="w-full justify-start border-b rounded-none">
        <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
      </TabsList>
      
      <TabsContent value="dashboard" className="mt-0">
        <EventDashboard eventId={id} />
      </TabsContent>
    </Tabs>
  );
};