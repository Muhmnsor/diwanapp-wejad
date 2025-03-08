
import { useParams } from "react-router-dom";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectTasksList } from "./components/ProjectTasksList";
import { useProjectDetails } from "./hooks/useProjectDetails";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useProjectStages } from "./hooks/useProjectStages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecurringTaskSection } from "./components/recurring/RecurringTaskSection";

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  
  const { project, isLoading: isProjectLoading } = useProjectDetails(projectId);
  const { members, isLoading: isMembersLoading } = useProjectMembers(projectId);
  const { stages, isLoading: isStagesLoading } = useProjectStages(projectId);
  
  // Show loading state if any data is still loading
  if (isProjectLoading || isMembersLoading || isStagesLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse rounded-lg bg-muted h-96 w-full max-w-4xl"></div>
      </div>
    );
  }
  
  if (!project) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-bold">المشروع غير موجود</h2>
        <p className="text-muted-foreground">لم يتم العثور على المشروع المطلوب</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />
      
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="tasks" className="flex-1">المهام</TabsTrigger>
          <TabsTrigger value="recurring" className="flex-1">المهام المتكررة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <ProjectTasksList
            projectId={projectId}
            stages={stages}
            projectMembers={members}
          />
        </TabsContent>
        
        <TabsContent value="recurring">
          <RecurringTaskSection
            projectId={projectId}
            projectMembers={members}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
