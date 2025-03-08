
import { useParams } from "react-router-dom";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { WorkspaceTasksList } from "./components/WorkspaceTasksList";
import { WorkspaceProjects } from "./components/WorkspaceProjects";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspaceDetails } from "./hooks/useWorkspaceDetails";
import { useWorkspaceMembers } from "./hooks/useWorkspaceMembers";
import { RecurringTaskSection } from "../project-details/components/recurring/RecurringTaskSection";

export const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  
  const { workspace, isLoading: isWorkspaceLoading } = useWorkspaceDetails(workspaceId);
  const { members, isLoading: isMembersLoading } = useWorkspaceMembers(workspaceId);
  
  // Show loading state if any data is still loading
  if (isWorkspaceLoading || isMembersLoading) {
    return (
      <div className="py-8 flex justify-center">
        <div className="animate-pulse rounded-lg bg-muted h-96 w-full max-w-4xl"></div>
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="py-8 text-center">
        <h2 className="text-xl font-bold">مساحة العمل غير موجودة</h2>
        <p className="text-muted-foreground">لم يتم العثور على مساحة العمل المطلوبة</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <WorkspaceHeader workspace={workspace} />
      
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="w-full mb-6">
          <TabsTrigger value="tasks" className="flex-1">المهام</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1">المشاريع</TabsTrigger>
          <TabsTrigger value="recurring" className="flex-1">المهام المتكررة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tasks">
          <WorkspaceTasksList 
            workspaceId={workspaceId} 
            workspaceMembers={members}
          />
        </TabsContent>
        
        <TabsContent value="projects">
          <WorkspaceProjects workspaceId={workspaceId} />
        </TabsContent>
        
        <TabsContent value="recurring">
          <RecurringTaskSection
            workspaceId={workspaceId}
            projectMembers={members}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
