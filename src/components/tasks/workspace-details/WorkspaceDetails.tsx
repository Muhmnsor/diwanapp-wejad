
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { WorkspaceProgress } from "./components/WorkspaceProgress";
import { TasksList } from "../project-details/TasksList";
import { WorkspaceAddTaskDialog } from "./WorkspaceAddTaskDialog";
import { ProjectMember } from "../project-details/types/projectMember";

interface WorkspaceDetailsProps {
  workspaceId: string;
}

export const WorkspaceDetails = ({ workspaceId }: WorkspaceDetailsProps) => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const fetchWorkspaceDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch workspace details
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', workspaceId)
        .single();
        
      if (workspaceError) throw workspaceError;
      setWorkspace(workspaceData);
      
      // Fetch workspace members
      const { data: membersData, error: membersError } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          role,
          profiles:user_id (
            display_name,
            email
          )
        `)
        .eq('workspace_id', workspaceId);
        
      if (membersError) throw membersError;
      
      // Transform members data into ProjectMember format
      const formattedMembers: ProjectMember[] = membersData.map(member => ({
        id: member.id,
        user_id: member.user_id,
        role: member.role,
        display_name: member.profiles?.display_name || 'Unknown User',
        email: member.profiles?.email || ''
      }));
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching workspace details:', error);
      toast.error('حدث خطأ أثناء تحميل بيانات مساحة العمل');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchWorkspaceDetails();
  }, [workspaceId]);
  
  const refreshTasks = async () => {
    // This function will be called after adding a new task
    // No need to implement any logic here as the TasksList component
    // has its own state management
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-72 w-full" />
      </div>
    );
  }
  
  if (!workspace) {
    return <div>مساحة العمل غير موجودة</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{workspace.name}</h1>
        <Button onClick={() => setIsAddDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          إضافة مهمة
        </Button>
      </div>
      
      <WorkspaceHeader workspace={workspace} members={members} />
      <WorkspaceProgress workspaceId={workspaceId} />
      
      <TasksList 
        projectId={workspaceId} 
        isWorkspace={true}
      />
      
      <WorkspaceAddTaskDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen} 
        workspaceId={workspaceId} 
        onTaskAdded={refreshTasks}
        workspaceMembers={members}
      />
    </div>
  );
};
