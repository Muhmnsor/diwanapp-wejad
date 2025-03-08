
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { WorkspaceOverview } from "./components/WorkspaceOverview";
import { WorkspaceTasksList } from "./components/WorkspaceTasksList";
import { ProjectMember } from "../project-details/hooks/useProjectMembers";

const WorkspaceDetails = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  
  useEffect(() => {
    if (!workspaceId) return;
    
    const fetchWorkspace = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch workspace details
        const { data, error } = await supabase
          .from("workspaces")
          .select("*, total_tasks:tasks(count)")
          .eq("id", workspaceId)
          .single();
        
        if (error) throw error;
        
        // Fetch completed tasks count
        const { count: completedCount, error: completedError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "completed");
        
        if (completedError) throw completedError;
        
        // Fetch pending tasks count
        const { count: pendingCount, error: pendingError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .eq("status", "pending");
        
        if (pendingError) throw pendingError;
        
        // Fetch workspace members
        const { data: membersData, error: membersError } = await supabase
          .from("workspace_members")
          .select(`
            *,
            profiles:user_id (
              display_name,
              email
            )
          `)
          .eq("workspace_id", workspaceId);
        
        if (membersError) throw membersError;
        
        // Convert to ProjectMember format for use with task components
        const formattedMembers: ProjectMember[] = membersData.map(member => ({
          user_id: member.user_id,
          role: member.role,
          display_name: member.profiles?.display_name || member.profiles?.email || 'مستخدم',
          user_email: member.profiles?.email || ''
        }));
        
        setProjectMembers(formattedMembers);
        
        // Update workspace with counts
        setWorkspace({
          ...data,
          completed_tasks: completedCount,
          pending_tasks: pendingCount,
          members_count: membersData.length
        });
      } catch (err: any) {
        console.error("Error fetching workspace details:", err);
        setError(err.message || "فشل في تحميل بيانات مساحة العمل");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspace();
  }, [workspaceId]);
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-100">
            <h2 className="text-xl font-semibold text-red-700 mb-2">حدث خطأ</h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto" dir="rtl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {isLoading ? "جاري التحميل..." : workspace?.name || "مساحة العمل"}
            </h1>
            <p className="text-gray-600">
              {isLoading ? "..." : workspace?.description || "إدارة المهام والمشاريع"}
            </p>
          </div>
          
          {/* Workspace Overview */}
          <WorkspaceOverview workspace={workspace} isLoading={isLoading} />
          
          {/* Workspace Tasks List */}
          <WorkspaceTasksList workspaceId={workspaceId || ""} projectMembers={projectMembers} />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WorkspaceDetails;
