import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project } from "@/types/project";
import { EventDashboard } from "@/components/admin/EventDashboard";

interface ProjectAdminTabsProps {
  project: Project;
  isAdmin: boolean;
  id: string;
}

export const ProjectAdminTabs = ({
  project,
  isAdmin,
  id,
}: ProjectAdminTabsProps) => {
  console.log('ProjectAdminTabs - isAdmin:', isAdmin);

  if (!isAdmin) return null;

  return (
    <div className="container mx-auto px-4">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-white" dir="rtl">
          <TabsTrigger value="details">تفاصيل المشروع</TabsTrigger>
          <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-0">
          <div className="py-6">
            {/* Project details content will be rendered in ProjectDetailsView */}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6 px-4 md:px-8">
          <EventDashboard eventId={id} />
        </TabsContent>
      </Tabs>
    </div>
  );
};