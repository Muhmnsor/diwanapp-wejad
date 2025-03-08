
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useParams } from "react-router-dom";
import { WorkspaceHeader } from "../workspace/WorkspaceHeader";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkspaceTasksList } from "./components/WorkspaceTasksList";
import { WorkspaceProgress } from "../workspace/WorkspaceProgress";
import { useProjectMembers } from "../project-details/hooks/useProjectMembers";
import { ProjectMember } from "../project-details/types/projectMember";

export const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  
  useEffect(() => {
    if (!workspaceId) return;
    
    const fetchWorkspaceDetails = async () => {
      setIsLoading(true);
      try {
        // Fetch workspace details
        const { data: workspaceData, error: workspaceError } = await supabase
          .from('portfolio_workspaces')
          .select('*')
          .eq('id', workspaceId)
          .single();
          
        if (workspaceError) {
          console.error("Error fetching workspace:", workspaceError);
          toast.error("تعذر تحميل بيانات مساحة العمل");
          return;
        }
        
        setWorkspace(workspaceData);
        
        // Fetch workspace members
        const { data: membersData, error: membersError } = await supabase
          .from('portfolio_workspace_members')
          .select(`
            user_id,
            role,
            users (
              display_name,
              email
            )
          `)
          .eq('workspace_id', workspaceId);
          
        if (membersError) {
          console.error("Error fetching workspace members:", membersError);
        } else if (membersData) {
          // Transform the data to match ProjectMember type
          const projectMembers: ProjectMember[] = membersData.map(member => ({
            id: member.user_id, // Using user_id as the id property
            user_id: member.user_id,
            user_display_name: member.users?.display_name,
            user_email: member.users?.email,
            role: member.role
          }));
          
          setMembers(projectMembers);
        }
      } catch (error) {
        console.error("Error loading workspace details:", error);
        toast.error("حدث خطأ أثناء تحميل البيانات");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspaceDetails();
  }, [workspaceId]);
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" dir="rtl">
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-32 w-full mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  
  if (!workspace) {
    return (
      <div className="container mx-auto px-4 py-8 text-center" dir="rtl">
        <h2 className="text-xl font-semibold text-gray-700">لم يتم العثور على مساحة العمل</h2>
        <p className="text-gray-500 mt-2">تأكد من الرابط وحاول مرة أخرى</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <WorkspaceHeader workspace={workspace} />
      
      <div className="my-6">
        <WorkspaceProgress workspace={workspace} />
      </div>
      
      <div>
        <WorkspaceTasksList 
          workspaceId={workspaceId || ''} 
          projectMembers={members}
        />
      </div>
    </div>
  );
};
