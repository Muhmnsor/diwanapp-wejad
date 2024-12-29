import { Project } from "@/types/project";
import { ProjectContent } from "./ProjectContent";
import { ProjectImage } from "./ProjectImage";
import { ProjectTitle } from "./ProjectTitle";
import { ProjectAdminTabs } from "./admin/ProjectAdminTabs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventDashboard } from "@/components/admin/EventDashboard";

interface ProjectDetailsViewProps {
  project: Project;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  id: string;
}

export const ProjectDetailsView = ({
  project,
  isAdmin,
  onEdit,
  onDelete,
  id
}: ProjectDetailsViewProps) => {
  console.log('ProjectDetailsView - User is admin:', isAdmin);

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectImage imageUrl={project.image_url} title={project.title} />
      
      <div className="container mx-auto px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ProjectTitle
            title={project.title}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />

          {isAdmin ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-white" dir="rtl">
                <TabsTrigger value="details">تفاصيل المشروع</TabsTrigger>
                <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="mt-0">
                <ProjectContent project={project} />
              </TabsContent>

              <TabsContent value="dashboard" className="mt-6 px-4 md:px-8">
                <EventDashboard eventId={id} isProject={true} />
              </TabsContent>
            </Tabs>
          ) : (
            <ProjectContent project={project} />
          )}
        </div>
      </div>
    </div>
  );
};