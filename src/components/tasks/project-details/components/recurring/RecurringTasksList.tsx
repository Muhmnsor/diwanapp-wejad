
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Calendar, RefreshCw, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { RecurringTaskDialog } from "./RecurringTaskDialog";
import { ProjectMember } from "../../hooks/useProjectMembers";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface RecurringTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  category: string | null;
  recurrence_type: string;
  day_of_month: number | null;
  day_of_week: number | null;
  is_active: boolean;
  requires_deliverable: boolean;
  last_generated_date: string | null;
  next_generation_date: string | null;
  created_at: string;
}

interface RecurringTasksListProps {
  projectId?: string;
  workspaceId?: string;
  projectMembers: ProjectMember[];
}

export const RecurringTasksList = ({
  projectId,
  workspaceId,
  projectMembers
}: RecurringTasksListProps) => {
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const fetchRecurringTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('recurring_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else if (workspaceId) {
        query = query.eq('workspace_id', workspaceId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setRecurringTasks(data || []);
    } catch (error) {
      console.error("Error fetching recurring tasks:", error);
      toast.error("حدث خطأ أثناء جلب المهام المتكررة");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchRecurringTasks();
  }, [projectId, workspaceId]);
  
  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;
    
    try {
      const { error } = await supabase
        .from('recurring_tasks')
        .delete()
        .eq('id', deleteTaskId);
      
      if (error) throw error;
      
      toast.success("تم حذف المهمة المتكررة بنجاح");
      fetchRecurringTasks();
    } catch (error) {
      console.error("Error deleting recurring task:", error);
      toast.error("حدث خطأ أثناء حذف المهمة المتكررة");
    } finally {
      setDeleteTaskId(null);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const confirmDelete = (taskId: string) => {
    setDeleteTaskId(taskId);
    setIsDeleteDialogOpen(true);
  };
  
  const formatRecurrenceInfo = (task: RecurringTask) => {
    if (task.recurrence_type === "monthly" && task.day_of_month) {
      return `يوم ${task.day_of_month} من كل شهر`;
    }
    return "غير محدد";
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "غير محدد";
    return new Date(dateString).toLocaleDateString('ar-SA');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">المهام المتكررة</h3>
        <Button 
          onClick={() => setIsAddDialogOpen(true)}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          إضافة مهمة متكررة
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : recurringTasks.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">لا توجد مهام متكررة</p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              variant="outline" 
              className="mt-4"
            >
              إضافة مهمة متكررة
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recurringTasks.map(task => (
            <Card key={task.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex border-r-4 border-l-0 rtl:border-l-4 rtl:border-r-0 rounded-r-sm rtl:rounded-r-none rtl:rounded-l-sm h-full" style={{ borderColor: getPriorityColor(task.priority).replace('bg-', 'rgb-').replace('500', '500') }}>
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between">
                      <h4 className="font-medium text-base">{task.title}</h4>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => confirmDelete(task.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <RefreshCw className="h-3 w-3" />
                        {formatRecurrenceInfo(task)}
                      </Badge>
                      
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        تاريخ الاستحقاق التالي: {formatDate(task.next_generation_date)}
                      </Badge>
                      
                      {task.requires_deliverable && (
                        <Badge>المستلمات إلزامية</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      <RecurringTaskDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        projectId={projectId}
        workspaceId={workspaceId}
        projectMembers={projectMembers}
        onSuccess={fetchRecurringTasks}
      />
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه المهمة المتكررة؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف المهمة المتكررة بشكل نهائي. لن يتم حذف المهام التي تم إنشاؤها بالفعل.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTask} className="bg-red-500 hover:bg-red-600">حذف</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
