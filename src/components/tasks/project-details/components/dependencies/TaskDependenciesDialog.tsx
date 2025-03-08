
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useTaskDependencies } from "../../hooks/useTaskDependencies";
import { Task } from "../../types/task";
import { Button } from "@/components/ui/button";
import { Check, X, AlertCircle, Link2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";

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
    isLoading 
  } = useTaskDependencies(task.id);
  
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  
  useEffect(() => {
    if (open && projectId) {
      fetchAvailableTasks();
    }
  }, [open, projectId, task.id]);
  
  const fetchAvailableTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
        .neq('id', task.id); // Don't include the current task
      
      if (error) throw error;
      
      // Filter out tasks that are already dependencies
      const dependencyIds = dependencies.map(d => d.id);
      const filteredTasks = data?.filter(t => !dependencyIds.includes(t.id)) || [];
      
      setAvailableTasks(filteredTasks);
    } catch (error) {
      console.error("Error fetching available tasks:", error);
    }
  };
  
  const handleAddDependency = async () => {
    if (!selectedTaskId) return;
    
    setIsAdding(true);
    try {
      await addDependency(selectedTaskId, 'finish-to-start');
      setSelectedTaskId("");
      await fetchAvailableTasks(); // Refresh the list
    } finally {
      setIsAdding(false);
    }
  };
  
  const handleRemoveDependency = async (dependencyId: string) => {
    await removeDependency(dependencyId);
    await fetchAvailableTasks(); // Refresh the list
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
                إضافة
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              هذه المهمة ستعتمد على المهام المختارة (لا يمكن إكمالها حتى تكتمل المهمة المختارة)
            </p>
          </div>
          
          <Separator />
          
          {/* Dependencies list */}
          <div>
            <h3 className="text-sm font-medium mb-2">المهام التي تعتمد عليها هذه المهمة</h3>
            {dependencies.length === 0 ? (
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
            {dependentTasks.length === 0 ? (
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
