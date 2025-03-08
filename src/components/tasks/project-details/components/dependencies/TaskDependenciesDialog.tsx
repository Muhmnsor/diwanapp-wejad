
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useTaskDependencies } from "../../hooks/useTaskDependencies";
import { Task } from "../../types/task";
import { Link2, Check } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { DependencySelector } from "./DependencySelector";
import { DependencyList } from "./DependencyList";
import { DependencyWarning } from "./DependencyWarning";
import { fetchAvailableTasks } from "../../hooks/useTaskDependencies.service";
import { DependencyType } from "../../types/dependency";

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
  const [dependencyType, setDependencyType] = useState<DependencyType>("finish-to-start");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  
  useEffect(() => {
    if (open && projectId) {
      loadAvailableTasks();
    }
  }, [open, projectId, task.id, dependencies]);
  
  const loadAvailableTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const tasksData = await fetchAvailableTasks(projectId, task.id, dependencies);
      setAvailableTasks(tasksData);
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
      const result = await addDependency(selectedTaskId, dependencyType);
      
      if (result === true) {
        setSelectedTaskId("");
        // Refresh dependencies and available tasks
        await fetchDependencies();
        await loadAvailableTasks();
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
      await loadAvailableTasks(); // Refresh the list
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
          <DependencySelector
            availableTasks={availableTasks}
            isLoadingTasks={isLoadingTasks}
            selectedTaskId={selectedTaskId}
            onSelectedTaskChange={setSelectedTaskId}
            onAddDependency={handleAddDependency}
            isAdding={isAdding}
            dependencyType={dependencyType}
            onDependencyTypeChange={setDependencyType}
          />
          
          <Separator />
          
          <DependencyList
            title="المهام التي تعتمد عليها هذه المهمة"
            tasks={dependencies}
            isLoading={isDependenciesLoading}
            emptyMessage="لا توجد اعتماديات حالياً"
            onRemove={handleRemoveDependency}
            getStatusBadge={getStatusBadge}
          />
          
          <Separator />
          
          <DependencyList
            title="المهام التي تعتمد على هذه المهمة"
            tasks={dependentTasks}
            isLoading={isDependenciesLoading}
            emptyMessage="لا توجد مهام تعتمد على هذه المهمة"
            getStatusBadge={getStatusBadge}
            isDependent={true}
          />
          
          <DependencyWarning
            taskStatus={task.status}
            dependentTasks={dependentTasks}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
