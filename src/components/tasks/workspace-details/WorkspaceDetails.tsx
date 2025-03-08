
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TasksList } from "../project-details/TasksList";
import { WorkspaceHeader } from "../workspace/WorkspaceHeader";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkspaceProgress } from "../workspace/WorkspaceProgress";
import { WorkspaceAddTaskDialog } from "./dialogs/WorkspaceAddTaskDialog";
import { ProjectMember } from "../project-details/types/projectMember";

interface WorkspaceDetailsProps {
  workspaceId: string;
}

export const WorkspaceDetails = ({ workspaceId }: WorkspaceDetailsProps) => {
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
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
        .select('user_id, role, profiles(display_name, email)')
        .eq('workspace_id', workspaceId);
        
      if (membersError) throw membersError;
      
      // Transform the members data to match ProjectMember interface
      const transformedMembers: ProjectMember[] = membersData.map((member: any) => ({
        id: member.user_id, // Use user_id as the id
        user_id: member.user_id,
        role: member.role,
        display_name: member.profiles?.display_name || 'Unknown User',
        user_email: member.profiles?.email || 'No email'
      }));
      
      setMembers(transformedMembers);
      
      // Fetch task statistics
      const { data: taskStatsData, error: taskStatsError } = await supabase
        .from('tasks')
        .select('status')
        .eq('workspace_id', workspaceId);
        
      if (taskStatsError) throw taskStatsError;
      
      const total = taskStatsData.length;
      const completed = taskStatsData.filter(task => task.status === 'completed').length;
      
      setTotalTasks(total);
      setCompletedTasks(completed);
    } catch (error) {
      console.error('Error fetching workspace details:', error);
      toast.error('حدث خطأ أثناء تحميل تفاصيل مساحة العمل');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceDetails();
    }
  }, [workspaceId]);
  
  const handleAddTask = () => {
    setIsAddDialogOpen(true);
  };
  
  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }
  
  if (!workspace) {
    return <div>لم يتم العثور على مساحة العمل</div>;
  }
  
  return (
    <div className="space-y-6" dir="rtl">
      <WorkspaceHeader
        name={workspace.name}
        description={workspace.description}
      />
      
      <WorkspaceProgress
        totalTasks={totalTasks}
        completedTasks={completedTasks}
      />
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">المهام</h2>
        <Button onClick={handleAddTask}>
          <Plus className="h-4 w-4 mr-1" />
          إضافة مهمة
        </Button>
      </div>
      
      <TasksList 
        projectId={workspaceId} 
        isWorkspace={true}
      />
      
      <WorkspaceAddTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        workspaceId={workspaceId}
        onTaskAdded={fetchWorkspaceDetails}
        workspaceMembers={members}
      />
    </div>
  );
};
