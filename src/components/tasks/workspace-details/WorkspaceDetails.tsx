
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkspaceHeader } from "./components/WorkspaceHeader";
import { TasksList } from "../project-details/TasksList";
import { WorkspaceAddTaskDialog } from "./WorkspaceAddTaskDialog";
import { ProjectMember } from "../project-details/types/projectMember";
import { WorkspaceProgress } from "./components/WorkspaceProgress";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  
  // Fetch workspace details and members
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!workspaceId) return;
      
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
          .select('*')
          .eq('workspace_id', workspaceId);
        
        if (membersError) throw membersError;
        
        // Convert to ProjectMember format
        const formattedMembers: ProjectMember[] = membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          user_display_name: member.user_display_name || 'User',
          user_email: member.user_email || '',
          role: member.role
        }));
        
        setMembers(formattedMembers);
      } catch (error) {
        console.error("Error fetching workspace details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspaceDetails();
  }, [workspaceId]);
  
  const refreshTasks = async () => {
    // This function will be passed to the WorkspaceAddTaskDialog
    // to refresh the tasks list after adding a new task
    console.log("Refreshing tasks...");
    // You can add additional refresh logic here if needed
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-64 w-full" />
              </div>
            ) : workspace ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold">{workspace.name}</h1>
                  <Button onClick={() => setIsAddTaskDialogOpen(true)} className="gap-1">
                    <Plus className="h-4 w-4" />
                    إضافة مهمة
                  </Button>
                </div>
                
                <WorkspaceHeader 
                  workspace={workspace} 
                  members={members} 
                />
                
                <WorkspaceProgress 
                  workspaceId={workspaceId || ""} 
                />
                
                <TasksList 
                  projectId={workspaceId || ""} 
                  isWorkspace={true} 
                />
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-50 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 mb-2">لم يتم العثور على مساحة العمل</h3>
                <p className="text-gray-500">تأكد من الرابط أو عد إلى الصفحة السابقة</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Task Dialog */}
      {workspace && (
        <WorkspaceAddTaskDialog
          open={isAddTaskDialogOpen}
          onOpenChange={setIsAddTaskDialogOpen}
          workspaceId={workspaceId || ""}
          onTaskAdded={refreshTasks}
          workspaceMembers={members}
        />
      )}
      
      <Footer />
    </div>
  );
};

export default WorkspaceDetails;
