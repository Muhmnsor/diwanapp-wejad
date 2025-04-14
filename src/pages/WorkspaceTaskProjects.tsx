import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useParams } from "react-router-dom";
import { TaskProjectsList } from "@/components/tasks/projects/TaskProjectsList";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { CreateTaskProjectDialog } from "@/components/tasks/projects/CreateTaskProjectDialog";
import { useAuthStore } from "@/store/authStore"; // تم إضافة الاستيراد هنا

const WorkspaceTaskProjects = () => {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const [workspaceName, setWorkspaceName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  
  const [isWorkspaceAdmin, setIsWorkspaceAdmin] = useState<boolean>(false); // تم إضافة حالة جديدة للتحقق من دور المستخدم
  const { user } = useAuthStore(); // تم إضافة استيراد حالة المستخدم
  
  useEffect(() => {
    const fetchWorkspaceName = async () => {
      if (!workspaceId) return;
      
      try {
        console.log("Fetching workspace with ID:", workspaceId);
        
        // Try to fetch from portfolio_workspaces table
        const { data, error } = await supabase
          .from('portfolio_workspaces')
          .select('name')
          .eq('id', workspaceId)
          .single();
        
        if (error) {
          console.error('Error fetching from portfolio_workspaces:', error);
          
          // If that fails, try the workspaces table
          const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('name')
            .eq('id', workspaceId)
            .single();
            
          if (wsError) {
            console.error('Error fetching from workspaces:', wsError);
            setError(true);
            toast.error("تعذر العثور على مساحة العمل");
            return;
          }
          
          if (wsData) {
            console.log("Found workspace in workspaces table:", wsData);
            setWorkspaceName(wsData.name);
          }
        } else if (data) {
          console.log("Found workspace in portfolio_workspaces table:", data);
          setWorkspaceName(data.name);
        }
      } catch (error) {
        console.error('Error:', error);
        setError(true);
        toast.error("حدث خطأ أثناء تحميل بيانات مساحة العمل");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWorkspaceName();
  }, [workspaceId]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!workspaceId || !user?.id) return;
      
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('role')
        .eq('workspace_id', workspaceId)
        .eq('user_id', user.id)
        .single();
        
      if (!memberError && memberData) {
        setIsWorkspaceAdmin(memberData.role === 'admin');
      }
    };

    checkUserRole();
  }, [workspaceId, user?.id]); // تأكد من استدعاء checkUserRole عند تغير workspaceId أو user.id

  const handleCreateProject = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto" dir="rtl">
            <div className="flex justify-between items-center mb-6">
              {isLoading ? (
                <Skeleton className="h-8 w-64" />
              ) : (
                <h1 className="text-2xl font-bold">
                  {workspaceName ? `مشاريع ${workspaceName}` : 'مشاريع مساحة العمل'}
                </h1>
              )}
              {isWorkspaceAdmin && (
                <Button onClick={handleCreateProject} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  إنشاء مشروع جديد
                </Button>
              )}
            </div>
            {workspaceId && !error && <TaskProjectsList workspaceId={workspaceId} />}
            {error && (
              <div className="text-center p-8 bg-gray-50 rounded-lg border shadow-sm">
                <h3 className="text-lg font-medium text-gray-600 mb-2">لم يتم العثور على مساحة العمل</h3>
                <p className="text-gray-500">تأكد من الرابط أو عد إلى الصفحة السابقة</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
      
      {workspaceId && (
        <CreateTaskProjectDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          workspaceId={workspaceId} 
        />
      )}
    </div>
  );
};

export default WorkspaceTaskProjects;
