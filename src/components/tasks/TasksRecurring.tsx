
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar, Check, Clock, Pause, Play, Repeat, Trash } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import { TaskPriorityBadge } from "../tasks/components/priority/TaskPriorityBadge";
import { useAuthStore } from "@/store/authStore";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  recurrence_type: string;
  interval: number;
  day_of_month?: number | null;
  day_of_week?: number | null;
  priority: string;
  category?: string | null;
  project_id?: string | null;
  workspace_id?: string | null;
  created_by: string;
  created_at: string;
  is_active: boolean;
  assign_to: string | null;
  last_generated_date: string | null;
  next_generation_date: string | null;
  project_name?: string | null;
  workspace_name?: string | null;
  assignee_name?: string | null;
  requires_deliverable?: boolean;
}

export const TasksRecurring = () => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRecurringTasks = async () => {
      setIsLoading(true);
      try {
        if (!user) {
          console.log("No authenticated user found");
          setIsLoading(false);
          return;
        }

        console.log("Checking admin status for user:", user.id);
        const { data: isAdminData, error: isAdminError } = await supabase.rpc('is_admin', { user_id: user.id });
        
        if (isAdminError) {
          console.error("Error checking admin status:", isAdminError);
          toast.error("حدث خطأ أثناء التحقق من صلاحيات المستخدم");
          throw isAdminError;
        }
        
        setIsAdmin(isAdminData || false);
        console.log("Is admin:", isAdminData);

        // Simplified query to avoid join issues
        const { data, error } = await supabase
          .from('recurring_tasks')
          .select(`
            *,
            projects:project_id (name),
            workspaces:workspace_id (name),
            assignee:assign_to (display_name)
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error("Error fetching recurring tasks:", error);
          throw error;
        }

        console.log("Recurring tasks data:", data);
        
        const formattedTasks = data.map(task => ({
          ...task,
          project_name: task.projects?.name,
          workspace_name: task.workspaces?.name,
          assignee_name: task.assignee?.display_name,
        }));

        setRecurringTasks(formattedTasks);
      } catch (error) {
        console.error("Error fetching recurring tasks:", error);
        toast.error("حدث خطأ أثناء تحميل المهام المتكررة");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecurringTasks();
  }, [user]);

  const filteredTasks = recurringTasks.filter(task => {
    if (activeFilter === "all") return true;
    if (activeFilter === "active") return task.is_active;
    if (activeFilter === "paused") return !task.is_active;
    return true;
  });

  const toggleTaskStatus = async (taskId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .update({ is_active: !isActive })
        .eq('id', taskId);

      if (error) throw error;

      setRecurringTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, is_active: !isActive } : task
        )
      );

      toast.success(`تم ${!isActive ? 'تفعيل' : 'إيقاف'} المهمة بنجاح`);
    } catch (error) {
      console.error('Error toggling task status:', error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المهمة المتكررة؟')) return;

    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setRecurringTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('تم حذف المهمة المتكررة بنجاح');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('حدث خطأ أثناء حذف المهمة');
    }
  };

  const generateTasks = async () => {
    if (!isAdmin) {
      toast.error('لا تملك الصلاحيات الكافية لتنفيذ هذا الإجراء');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-recurring-tasks');

      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }
      
      console.log('Generate tasks response:', data);
      toast.success(`تم إنشاء ${data.tasksCreated} مهمة بنجاح`);
      
      // Simplified refresh query to match the format above
      const { data: refreshedData, error: refreshError } = await supabase
        .from('recurring_tasks')
        .select(`
          *,
          projects:project_id (name),
          workspaces:workspace_id (name),
          assignee:assign_to (display_name)
        `)
        .order('created_at', { ascending: false });

      if (refreshError) throw refreshError;

      const formattedTasks = refreshedData.map(task => ({
        ...task,
        project_name: task.projects?.name,
        workspace_name: task.workspaces?.name,
        assignee_name: task.assignee?.display_name,
      }));

      setRecurringTasks(formattedTasks);
    } catch (error) {
      console.error('Error generating tasks:', error);
      const errorMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء المهام';
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderRecurrence = (task: RecurringTask) => {
    if (task.recurrence_type === 'monthly' && task.day_of_month) {
      return `شهرياً - يوم ${task.day_of_month} من كل شهر`;
    } 
    if (task.recurrence_type === 'weekly' && task.day_of_week !== undefined) {
      const weekdays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
      return `أسبوعياً - يوم ${weekdays[task.day_of_week]}`;
    }
    if (task.recurrence_type === 'daily') {
      return task.interval === 1 ? 'يومياً' : `كل ${task.interval} أيام`;
    }
    return `${task.recurrence_type} (كل ${task.interval || 1})`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full max-w-md" onValueChange={setActiveFilter}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="paused">متوقفة</TabsTrigger>
            <TabsTrigger value="active">نشطة</TabsTrigger>
            <TabsTrigger value="all">جميع المهام</TabsTrigger>
          </TabsList>
        </Tabs>

        {isAdmin && (
          <Button 
            onClick={generateTasks} 
            disabled={isGenerating}
            variant="outline"
            className="flex gap-2 items-center"
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                جاري الإنشاء...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4" />
                إنشاء المهام المجدولة
              </>
            )}
          </Button>
        )}
      </div>

      {filteredTasks.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Repeat className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-medium mb-2 text-center">لا توجد مهام متكررة</h3>
            <p className="text-muted-foreground text-center max-w-md">
              يمكنك إنشاء مهام متكررة ليتم إنشاؤها تلقائياً حسب الجدول الزمني المحدد
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map(task => (
            <Card key={task.id} className={`overflow-hidden border-r-4 ${!task.is_active ? 'border-r-muted' : task.priority === 'high' ? 'border-r-orange-500' : task.priority === 'medium' ? 'border-r-blue-500' : 'border-r-green-500'}`}>
              <CardHeader className="pb-2">
                <div className="flex flex-row-reverse justify-between items-start">
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toggleTaskStatus(task.id, task.is_active)}>
                      {task.is_active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTask(task.id)}>
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-base font-medium line-clamp-1 text-right">{task.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="pb-4 pt-0">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span>{renderRecurrence(task)}</span>
                    <Repeat className="h-4 w-4 shrink-0 mr-auto" />
                  </div>
                  
                  {task.next_generation_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>الإنشاء التالي: {formatDate(task.next_generation_date)}</span>
                      <Calendar className="h-4 w-4 shrink-0 mr-auto" />
                    </div>
                  )}
                  
                  {task.last_generated_date && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>آخر إنشاء: {formatDate(task.last_generated_date)}</span>
                      <Clock className="h-4 w-4 shrink-0 mr-auto" />
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <TaskPriorityBadge priority={task.priority} />
                    
                    {task.requires_deliverable && (
                      <div className="flex items-center gap-2 text-green-600">
                        <span>تتطلب مستلمات</span>
                        <Check className="h-4 w-4 shrink-0" />
                      </div>
                    )}
                  </div>

                  {task.project_name && (
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      <span>المشروع: {task.project_name}</span>
                    </div>
                  )}

                  {task.workspace_name && !task.project_name && (
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      <span>مساحة العمل: {task.workspace_name}</span>
                    </div>
                  )}

                  {task.assignee_name && (
                    <div className="flex items-center gap-2 text-muted-foreground justify-end">
                      <span>المسؤول: {task.assignee_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
