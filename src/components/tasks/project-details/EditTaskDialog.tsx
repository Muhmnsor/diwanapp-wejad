import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import { useToast } from "@/components/ui/use-toast";
import { useWorkspace } from "@/providers/workspace-provider";
import { useUser } from "@/providers/user-provider";

// Import the necessary hooks for task dependencies
import { supabase } from "@/integrations/supabase/client";
import { DependencyType } from "./hooks/useTaskDependencies";
import { useEffect, useState } from "react";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: any;
  projectStages: any[];
  projectMembers: any[];
  onTaskUpdated?: () => void;
}

export const EditTaskDialog = ({ 
  open, 
  onOpenChange,
  task,
  projectStages,
  projectMembers,
  onTaskUpdated
}: EditTaskDialogProps) => {
  const { toast } = useToast();
  const { workspaceId } = useWorkspace();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [taskDependencies, setTaskDependencies] = useState<{
    id?: string;
    taskId: string;
    dependencyType: DependencyType;
  }[]>([]);
  
  useEffect(() => {
    // Fetch task dependencies if task is provided
    const fetchDependencies = async () => {
      if (!task?.id) return;
      
      try {
        // Get dependencies where this task depends on others
        const { data: blockedByDeps, error: blockedByError } = await supabase
          .from('task_dependencies')
          .select('id, dependency_task_id, dependency_type')
          .eq('task_id', task.id);
          
        if (blockedByError) throw blockedByError;
        
        // Get dependencies where others depend on this task
        const { data: blocksDeps, error: blocksError } = await supabase
          .from('task_dependencies')
          .select('id, task_id, dependency_type')
          .eq('dependency_task_id', task.id);
          
        if (blocksError) throw blocksError;
        
        // Format the dependencies
        const formattedDeps = [
          ...(blockedByDeps || []).map(dep => ({
            id: dep.id,
            taskId: dep.dependency_task_id,
            dependencyType: dep.dependency_type as DependencyType
          })),
          ...(blocksDeps || []).map(dep => ({
            id: dep.id,
            taskId: dep.task_id,
            dependencyType: 'blocks' as DependencyType
          }))
        ];
        
        setTaskDependencies(formattedDeps);
      } catch (error) {
        console.error("Error fetching task dependencies:", error);
      }
    };
    
    fetchDependencies();
  }, [task?.id]);
  
  const handleSubmit = async (formData: any) => {
    if (!task) return;
    
    setIsSubmitting(true);
    
    try {
      // Extract dependencies from form data
      const { dependencies, ...taskData } = formData;
      
      // Update the task
      const { error } = await supabase
        .from('tasks')
        .update({
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          priority: taskData.priority,
          due_date: taskData.due_date,
          assigned_to: taskData.assigned_to,
          stage_id: taskData.stage_id,
          category: taskData.category,
          attachment_url: taskData.attachment_url,
          form_template: taskData.form_template,
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);
        
      if (error) throw error;
      
      // Handle dependencies - this requires more complex logic to add/remove correctly
      
      // 1. Get current dependencies
      const { data: currentDeps, error: depsError } = await supabase
        .from('task_dependencies')
        .select('id, task_id, dependency_task_id, dependency_type')
        .or(`task_id.eq.${task.id},dependency_task_id.eq.${task.id}`);
        
      if (depsError) throw depsError;
      
      // 2. Determine which dependencies to delete (those not in the new list)
      const depsToDelete = (currentDeps || []).filter(currentDep => {
        if (currentDep.task_id === task.id) {
          // This is a dependency where task depends on another
          return !dependencies.some((dep: any) => 
            dep.taskId === currentDep.dependency_task_id && 
            dep.dependencyType === currentDep.dependency_type
          );
        } else {
          // This is a dependency where another task depends on this one
          return !dependencies.some((dep: any) => 
            dep.taskId === currentDep.task_id && 
            dep.dependencyType === 'blocks'
          );
        }
      });
      
      // 3. Determine which dependencies to add (those in the new list but not in the current list)
      const depsToAdd = dependencies.filter((newDep: any) => {
        if (newDep.dependencyType === 'blocks') {
          // Task blocks another
          return !currentDeps?.some(currentDep => 
            currentDep.dependency_task_id === task.id && 
            currentDep.task_id === newDep.taskId
          );
        } else {
          // Task is blocked by another
          return !currentDeps?.some(currentDep => 
            currentDep.task_id === task.id && 
            currentDep.dependency_task_id === newDep.taskId &&
            currentDep.dependency_type === newDep.dependencyType
          );
        }
      });
      
      // 4. Delete removed dependencies
      if (depsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('task_dependencies')
          .delete()
          .in('id', depsToDelete.map(dep => dep.id));
          
        if (deleteError) throw deleteError;
      }
      
      // 5. Add new dependencies
      if (depsToAdd.length > 0) {
        const newDepRecords = depsToAdd.map((dep: any) => {
          if (dep.dependencyType === 'blocks') {
            // Task blocks another
            return {
              task_id: dep.taskId,
              dependency_task_id: task.id,
              dependency_type: 'blocked_by' // inverse relationship
            };
          } else {
            // Task is blocked by another
            return {
              task_id: task.id,
              dependency_task_id: dep.taskId,
              dependency_type: dep.dependencyType
            };
          }
        });
        
        const { error: addError } = await supabase
          .from('task_dependencies')
          .insert(newDepRecords);
          
        if (addError) throw addError;
      }
      
      // Success handling
      toast.success("تم تحديث المهمة بنجاح");
      onTaskUpdated?.();
      onOpenChange(false);
      
    } catch (error) {
      // Error handling
      console.error("Error updating task:", error);
      toast.error("حدث خطأ أثناء تحديث المهمة");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>تعديل المهمة</DialogTitle>
        </DialogHeader>
        
        {task && (
          <TaskForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            onCancel={() => onOpenChange(false)}
            projectId={task.project_id as string}
            projectStages={projectStages}
            projectMembers={projectMembers}
            isGeneral={task.is_general}
            initialTask={{
              ...task,
              dependencies: taskDependencies
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
