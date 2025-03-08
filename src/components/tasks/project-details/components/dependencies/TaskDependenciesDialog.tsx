
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useTaskDependencies } from "../../hooks/useTaskDependencies";
import { Task } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, Link2, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface TaskDependenciesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  projectId: string;
}

export const TaskDependenciesDialog = ({
  open,
  onOpenChange,
  task,
  projectId
}: TaskDependenciesDialogProps) => {
  const { 
    dependencies, 
    dependentTasks, 
    addDependency, 
    removeDependency,
    fetchDependencies,
    isLoading: isDependenciesLoading 
  } = useTaskDependencies(task.id);
  
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  useEffect(() => {
    if (open && projectId) {
      fetchAvailableTasks();
    }
  }, [open, projectId, task.id, dependencies]);
  
  const fetchAvailableTasks = async () => {
    setIsLoadingTasks(true);
    try {
      console.log(`Fetching available tasks for project: ${projectId}, type: ${typeof projectId}`);
      
      // Handle project_id comparison correctly regardless of type (UUID or string)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .filter('project_id', 'eq', projectId)
        .neq('id', task.id); // Don't include the current task
      
      if (error) {
        console.error("Error fetching available tasks:", error);
        toast.error("حدث خطأ أثناء جلب المهام المتاحة");
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} tasks for project`);
      
      if (!data || data.length === 0) {
        console.log("No available tasks found for this project");
        setAvailableTasks([]);
        setIsLoadingTasks(false);
        return;
      }
      
      // Filter out tasks that are already dependencies
      const dependencyIds = dependencies.map(d => d.id);
      
      console.log("Current dependency IDs:", dependencyIds);
      console.log("Tasks before filtering:", data);
      
      const filteredTasks = data.filter(t => !dependencyIds.includes(t.id));
      console.log("Tasks after filtering out dependencies:", filteredTasks);
      
      setAvailableTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
      toast.error("حدث خطأ أثناء جلب المهام المتاحة");
    } finally {
      setIsLoadingTasks(false);
    }
  };
  
  const handleAddDependency = async () => {
    if (!selectedTaskId) {
      toast.error("الرجاء اختيار مهمة");
      return;
    }
    
    setIsAdding(true);
    try {
      console.log(`Attempting to add dependency: Task ${task.id} depends on ${selectedTaskId}`);
      
      const result = await addDependency(selectedTaskId, 'finish-to-start');
      
      if (result === true) {
        console.log("Dependency added successfully");
        setSelectedTaskId("");
        toast.success("تمت إضافة الاعتمادية بنجاح");
        
        // Refresh dependencies
        await fetchDependencies();
        // Then refresh available tasks
        await fetchAvailableTasks();
      } else {
        console.log("Failed to add dependency");
        toast.error("فشل إضافة الاعتمادية");
      }
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast.error("حدث خطأ أثناء إضافة الاعتمادية");
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleRemoveDependency = async (dependencyId: string) => {
    try {
      await removeDependency(dependencyId);
      await fetchAvailableTasks(); // Refresh the list
    } catch (error) {
      console.error("Error removing dependency:", error);
      toast.error("حدث خطأ أثناء إزالة الاعتمادية");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            <Check className="mr-1 h-3 w-3" />
            مكتمل
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
            قيد التنفيذ
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            معلق
          </span>
        );
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="min-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            اعتماديات المهمة
          </DialogTitle>
          <DialogDescription>
            إدارة الاعتماديات بين المهام
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div>
            <h3 className="text-sm font-medium mb-2">إضافة اعتمادية جديدة</h3>
            
            {isLoadingTasks ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : availableTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2 italic">
                لا توجد مهام متاحة لإضافتها كاعتمادية
              </div>
            ) : (
              <div className="flex gap-2">
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="اختر مهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map(task => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={handleAddDependency} 
                  disabled={!selectedTaskId || isAdding}
                >
                  {isAdding ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : null}
                  إضافة
                </Button>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-1">
              هذه المهمة ستعتمد على المهام المختارة (لا يمكن إكمالها حتى تكتمل المهمة المختارة)
            </p>
          </div>
          
          <Separator />
          
          {/* Dependencies list */}
          <div>
            <h3 className="text-sm font-medium mb-2">المهام التي تعتمد عليها هذه المهمة</h3>
            {isDependenciesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : dependencies.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد اعتماديات حالياً</p>
            ) : (
              <ul className="space-y-2">
                {dependencies.map(dep => (
                  <li key={dep.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(dep.status)}
                      <span>{dep.title}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveDependency(dep.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <Separator />
          
          {/* Dependent tasks list */}
          <div>
            <h3 className="text-sm font-medium mb-2">المهام التي تعتمد على هذه المهمة</h3>
            {isDependenciesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : dependentTasks.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد مهام تعتمد على هذه المهمة</p>
            ) : (
              <ul className="space-y-2">
                {dependentTasks.map(dep => (
                  <li key={dep.id} className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(dep.status)}
                      <span>{dep.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      لا يمكن إكمالها حتى تكتمل هذه المهمة
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {task.status === 'completed' && dependentTasks.some(t => t.status !== 'completed') && (
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <p className="text-sm text-yellow-700">
                تنبيه: هناك مهام تعتمد على هذه المهمة ولم تكتمل بعد
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
