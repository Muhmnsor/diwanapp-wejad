
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Rocket, Copy, CheckCircle, Loader2, PlusCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuthStore } from "@/store/authStore";

export const DraftProjectTester = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [isLaunching, setIsLaunching] = useState(false);
  const [recentProject, setRecentProject] = useState<{id: string, title: string} | null>(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Create a test draft project
  const createDraftProject = async () => {
    setIsCreating(true);
    try {
      // Find a workspace to use
      const { data: workspaces, error: workspaceError } = await supabase
        .from('task_workspace')
        .select('id')
        .limit(1);
      
      if (workspaceError) throw workspaceError;
      
      if (!workspaces || workspaces.length === 0) {
        toast.error('لا توجد مساحات عمل للاختبار. قم بإنشاء مساحة عمل أولاً.');
        return;
      }
      
      const workspaceId = workspaces[0].id;
      const title = `مشروع اختبار المسودة ${new Date().toLocaleTimeString()}`;
      
      // Create draft project
      const { data: project, error: projectError } = await supabase
        .from('project_tasks')
        .insert({
          title,
          description: 'هذا مشروع تجريبي لاختبار وضع المسودة',
          status: 'draft',
          workspace_id: workspaceId,
          project_manager: user?.id,
          is_draft: true
        })
        .select()
        .single();
      
      if (projectError) throw projectError;
      
      // Create some test tasks
      const tasks = [
        { title: 'مهمة تجريبية 1', description: 'وصف المهمة', status: 'draft', assigned_to: user?.id },
        { title: 'مهمة تجريبية 2', description: 'وصف المهمة', status: 'draft' },
        { title: 'مهمة تجريبية 3', description: 'وصف المهمة', status: 'draft' }
      ];
      
      for (const task of tasks) {
        await supabase
          .from('tasks')
          .insert({
            ...task,
            project_id: project.id
          });
      }
      
      toast.success('تم إنشاء مشروع المسودة التجريبي بنجاح');
      setRecentProject({ id: project.id, title: project.title });
    } catch (error) {
      console.error('Error creating test draft project:', error);
      toast.error('حدث خطأ أثناء إنشاء مشروع المسودة');
    } finally {
      setIsCreating(false);
    }
  };

  // Launch the recent test project
  const launchRecentProject = async () => {
    if (!recentProject) {
      toast.error('لا يوجد مشروع حديث للإطلاق');
      return;
    }
    
    setIsLaunching(true);
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ 
          is_draft: false,
          status: 'in_progress'
        })
        .eq('id', recentProject.id);
      
      if (error) throw error;
      
      // Update tasks
      const { error: tasksError } = await supabase
        .from('tasks')
        .update({ status: 'pending' })
        .eq('project_id', recentProject.id)
        .eq('status', 'draft');
      
      if (tasksError) throw tasksError;
      
      toast.success('تم إطلاق المشروع التجريبي بنجاح');
    } catch (error) {
      console.error('Error launching test project:', error);
      toast.error('حدث خطأ أثناء إطلاق المشروع');
    } finally {
      setIsLaunching(false);
    }
  };

  // View the recent project
  const viewRecentProject = () => {
    if (!recentProject) {
      toast.error('لا يوجد مشروع حديث للعرض');
      return;
    }
    
    navigate(`/tasks/project/${recentProject.id}`);
  };

  return (
    <Card dir="rtl">
      <CardHeader>
        <CardTitle>اختبار مشاريع المسودة</CardTitle>
        <CardDescription>أداة لاختبار وظائف مشاريع المسودة وعملية الإطلاق</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            هذه الأداة تساعدك على اختبار وظيفة مشاريع المسودة. يمكنك إنشاء مشروع مسودة جديد، ثم إطلاقه أو عرضه.
          </AlertDescription>
        </Alert>
        
        {recentProject && (
          <div className="bg-blue-50 p-4 rounded border border-blue-200">
            <p className="font-medium text-blue-700 mb-1">آخر مشروع تم إنشاؤه:</p>
            <p className="text-blue-800">{recentProject.title}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        <Button 
          onClick={createDraftProject} 
          disabled={isCreating}
          className="gap-1"
        >
          {isCreating ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الإنشاء...</>
          ) : (
            <><PlusCircle className="h-4 w-4 mr-2" /> إنشاء مشروع مسودة</>
          )}
        </Button>
        
        <Button 
          onClick={launchRecentProject} 
          disabled={isLaunching || !recentProject}
          variant="outline" 
          className="gap-1"
        >
          {isLaunching ? (
            <><Loader2 className="h-4 w-4 animate-spin mr-2" /> جاري الإطلاق...</>
          ) : (
            <><Rocket className="h-4 w-4 mr-2" /> إطلاق المشروع</>
          )}
        </Button>
        
        <Button 
          onClick={viewRecentProject} 
          disabled={!recentProject}
          variant="secondary" 
          className="gap-1"
        >
          <Copy className="h-4 w-4 mr-2" /> عرض المشروع
        </Button>
      </CardFooter>
    </Card>
  );
};
