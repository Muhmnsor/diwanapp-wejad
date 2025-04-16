
import { useParams } from "react-router-dom";
import { ProjectHeader } from "./components/ProjectHeader";
import { ProjectTasksList } from "./components/ProjectTasksList";
import { useProjectDetails } from "./hooks/useProjectDetails";
import { useProjectMembers } from "./hooks/useProjectMembers";
import { useProjectStages } from "./hooks/useProjectStages";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export const ProjectDetails = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [stages, setStages] = useState<{ id: string; name: string }[]>([]);
  
  const { project, isLoading: isProjectLoading } = useProjectDetails(projectId);
  const { projectMembers, isLoading: isProjectMembersLoading } = useProjectMembers(projectId);
  
  // Pass the onStagesChange prop to useProjectStages
  const { 
    isLoading: isStagesLoading, 
    canViewStages 
  } = useProjectStages({ 
    projectId, 
    onStagesChange: setStages 
  });
  
  // Show loading state if any data is still loading
  if (isProjectLoading || isProjectMembersLoading || isStagesLoading) {
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
          {/* Additional tabs can be added here */}
        </TabsList>
        
        <TabsContent value="tasks">
          <ProjectTasksList
            projectId={projectId}
            stages={stages}
            projectMembers={projectMembers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
