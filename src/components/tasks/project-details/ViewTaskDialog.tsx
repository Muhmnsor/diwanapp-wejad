
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";
import { useSubtasks } from "./hooks/useSubtasks";
import { useTaskComments } from "./hooks/useTaskComments";
import { Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { TaskDependenciesBadge } from "./components/TaskDependenciesBadge";
import { useTaskDependencies } from "./hooks/useTaskDependencies";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export interface ViewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onTaskUpdated: () => void;
}

export const ViewTaskDialog = ({
  open,
  onOpenChange,
  task,
  onTaskUpdated
}: ViewTaskDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [assigneeName, setAssigneeName] = useState<string>("");
  const [creatorName, setCreatorName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { isBlockedByDependencies } = useTaskDependencies(task?.id);

  const { subtasks, isLoading: isLoadingSubtasks } = useSubtasks(task?.id);
  const { comments, isLoading: isLoadingComments } = useTaskComments(task?.id);

  // Fetch user names
  useEffect(() => {
    if (!open || !task) return;
    
    const fetchUserInfo = async () => {
      // Fetch assignee name
      if (task.assigned_to) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.assigned_to)
            .single();
            
          if (!error && data) {
            setAssigneeName(data.display_name || data.email || 'غير معروف');
          }
        } catch (err) {
          console.error('Error fetching assignee:', err);
        }
      }
      
      // Fetch creator name
      if (task.created_by) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('display_name, email')
            .eq('id', task.created_by)
            .single();
            
          if (!error && data) {
            setCreatorName(data.display_name || data.email || 'غير معروف');
          }
        } catch (err) {
          console.error('Error fetching creator:', err);
        }
      }
    };
    
    fetchUserInfo();
  }, [open, task]);

  const handleCompleteTask = async () => {
    if (!task) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Check if the task has pending dependencies
      if (isBlockedByDependencies) {
        setErrorMessage("لا يمكن إكمال هذه المهمة لأنها تعتمد على مهام أخرى غير مكتملة");
        toast.error("لا يمكن إكمال هذه المهمة بسبب تبعيات غير مكتملة");
        return;
      }
      
      // Check if there are incomplete subtasks
      const pendingSubtasks = subtasks.filter(st => st.status !== 'completed');
      if (pendingSubtasks.length > 0) {
        setErrorMessage("لا يمكن إكمال هذه المهمة لأن لديها مهام فرعية غير مكتملة");
        toast.error("يجب إكمال جميع المهام الفرعية أولاً");
        return;
      }
      
      // Update task status
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', task.id);
        
      if (error) throw error;
      
      toast.success("تم إكمال المهمة بنجاح");
      onTaskUpdated();
    } catch (err) {
      console.error('Error completing task:', err);
      setErrorMessage("حدث خطأ أثناء محاولة إكمال المهمة");
      toast.error("فشل في إكمال المهمة");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rtl max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{task?.title}</DialogTitle>
        </DialogHeader>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <h3 className="text-muted-foreground mb-2">وصف المهمة</h3>
              <p className="whitespace-pre-wrap">{task?.description || 'لا يوجد وصف'}</p>
            </div>
            
            <div>
              <h3 className="text-muted-foreground mb-2">تبعيات المهمة</h3>
              <TaskDependenciesBadge taskId={task?.id} showDetails />
            </div>
            
            {/* Subtasks and Comments sections would go here */}
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-muted-foreground mb-2">معلومات المهمة</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm">الحالة:</div>
                <div>
                  <Badge variant="default">
                    {task?.status === 'completed' ? 'مكتملة' : 
                     task?.status === 'in_progress' ? 'قيد التنفيذ' : 
                     task?.status === 'pending' ? 'معلقة' : task?.status}
                  </Badge>
                </div>
                
                <div className="text-sm">الأولوية:</div>
                <div>
                  <Badge variant={
                    task?.priority === 'high' ? 'destructive' : 
                    task?.priority === 'medium' ? 'warning' : 
                    'outline'
                  }>
                    {task?.priority === 'high' ? 'عالية' : 
                     task?.priority === 'medium' ? 'متوسطة' : 
                     task?.priority === 'low' ? 'منخفضة' : task?.priority}
                  </Badge>
                </div>
                
                <div className="text-sm">تاريخ الاستحقاق:</div>
                <div>{task?.due_date ? formatDate(task.due_date) : 'غير محدد'}</div>
                
                <div className="text-sm">مسند إلى:</div>
                <div>{assigneeName || 'غير مسند'}</div>
                
                <div className="text-sm">منشئ المهمة:</div>
                <div>{creatorName || 'غير معروف'}</div>
                
                <div className="text-sm">تاريخ الإنشاء:</div>
                <div>{task?.created_at ? formatDate(task.created_at) : 'غير معروف'}</div>
              </div>
            </div>
            
            {task?.status !== 'completed' && (
              <Button 
                onClick={handleCompleteTask} 
                disabled={isLoading || isBlockedByDependencies}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'إكمال المهمة'
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
