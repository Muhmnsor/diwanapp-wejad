
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/workspace";
import { toast } from "sonner";
import { useAuthStore } from "@/store/refactored-auth";

// Define NotificationType
export type NotificationType = 
  | "task_assignment" 
  | "task_status_change" 
  | "task_comment" 
  | "task_due_date" 
  | "subtask_completion"
  | "task_dependency";

export function useTaskStatusManagement(
  projectId: string | undefined,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  tasksByStage: Record<string, Task[]>,
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>
) {
  const [changingStatus, setChangingStatus] = useState<Record<string, boolean>>({});
  const { user } = useAuthStore();

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    if (!taskId || !newStatus) return;
    
    setChangingStatus(prev => ({ ...prev, [taskId]: true }));
    
    try {
      // First check for dependencies
      const { data: dependencies, error: depsError } = await supabase
        .from('task_dependencies')
        .select(`
          id,
          dependency_type,
          dependency_task_id,
          tasks:dependency_task_id (
            id,
            title,
            status
          )
        `)
        .eq('task_id', taskId);
        
      if (depsError) throw depsError;
      
      // Check if task can be completed based on dependencies
      if (newStatus === 'completed') {
        const blockingDependencies = (dependencies || []).filter(dep => {
          // For finish-to-X dependencies, prerequisite must be completed
          if ((dep.dependency_type === 'finish-to-start' || 
               dep.dependency_type === 'finish-to-finish' || 
               dep.dependency_type === 'blocked_by') && 
              dep.tasks?.status !== 'completed') {
            return true;
          }
          return false;
        });
        
        if (blockingDependencies.length > 0) {
          const titles = blockingDependencies.map(dep => dep.tasks?.title || 'Unknown Task').join(', ');
          toast.error(`لا يمكن إكمال هذه المهمة لأنها تعتمد على مهام أخرى غير مكتملة: ${titles}`);
          setChangingStatus(prev => ({ ...prev, [taskId]: false }));
          return;
        }
        
        // Also check for incomplete subtasks
        const { data: subtasks, error: subtasksError } = await supabase
          .from('subtasks')
          .select('id, status')
          .eq('task_id', taskId);
          
        if (subtasksError) throw subtasksError;
        
        const incompleteSubtasks = subtasks?.filter(st => st.status !== 'completed') || [];
        if (incompleteSubtasks.length > 0) {
          toast.error("يجب إكمال جميع المهام الفرعية قبل إكمال المهمة الرئيسية");
          setChangingStatus(prev => ({ ...prev, [taskId]: false }));
          return;
        }
      }
      
      // Update the task status
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      // Update tasksByStage state if it's being used
      if (Object.keys(tasksByStage).length > 0) {
        setTasksByStage(prev => {
          const newTasksByStage = { ...prev };
          
          // Remove task from its previous stage
          Object.keys(newTasksByStage).forEach(stageId => {
            newTasksByStage[stageId] = newTasksByStage[stageId].filter(t => t.id !== taskId);
          });
          
          // Get the task and update its status
          const updatedTask = tasks.find(t => t.id === taskId);
          if (updatedTask) {
            const taskWithNewStatus = { ...updatedTask, status: newStatus };
            // Find where to place the task now
            const targetStageId = taskWithNewStatus.stage_id;
            if (targetStageId && newTasksByStage[targetStageId]) {
              newTasksByStage[targetStageId] = [...newTasksByStage[targetStageId], taskWithNewStatus];
            }
          }
          
          return newTasksByStage;
        });
      }
      
      // Check if this task is a dependency for other tasks
      // If this task was completed, notify assignees of dependent tasks
      if (newStatus === 'completed') {
        const { data: dependentTasks, error: depTasksError } = await supabase
          .from('task_dependencies')
          .select(`
            id,
            dependency_type,
            task_id,
            tasks:task_id (
              id,
              title,
              assigned_to
            )
          `)
          .eq('dependency_task_id', taskId);
          
        if (depTasksError) throw depTasksError;
        
        // For each dependent task, check if all its dependencies are now met
        for (const depTask of dependentTasks || []) {
          // Only consider finish-to-X dependencies since this task is now completed
          if (depTask.dependency_type === 'finish-to-start' || 
              depTask.dependency_type === 'finish-to-finish' || 
              depTask.dependency_type === 'blocked_by') {
            
            // Check if the dependent task has other blocking dependencies
            const { data: otherDeps, error: otherDepsError } = await supabase
              .from('task_dependencies')
              .select(`
                id,
                dependency_type,
                dependency_task_id,
                tasks:dependency_task_id (
                  id,
                  status
                )
              `)
              .eq('task_id', depTask.task_id)
              .not('dependency_task_id', 'eq', taskId);
              
            if (otherDepsError) throw otherDepsError;
            
            // Check if there are any other blocking dependencies
            const stillBlocked = (otherDeps || []).some(od => 
              (od.dependency_type === 'finish-to-start' || 
               od.dependency_type === 'finish-to-finish' || 
               od.dependency_type === 'blocked_by') && 
              od.tasks?.status !== 'completed'
            );
            
            if (!stillBlocked && depTask.tasks?.assigned_to) {
              // All dependencies are met, send notification to assignee
              const { error: notifError } = await supabase
                .from('notifications')
                .insert({
                  user_id: depTask.tasks.assigned_to,
                  type: 'task_dependency' as NotificationType,
                  content: `يمكنك الآن العمل على المهمة "${depTask.tasks.title}" حيث تم إكمال المهام المطلوبة`,
                  related_id: depTask.task_id,
                  related_type: 'task',
                  created_by: user?.id
                });
                
              if (notifError) {
                console.error('Error sending notification:', notifError);
              }
            }
          }
        }
      }
      
      toast.success(`تم تغيير حالة المهمة إلى ${newStatus === 'completed' ? 'مكتملة' : 
                      newStatus === 'in_progress' ? 'قيد التنفيذ' : 'معلقة'}`);
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error("حدث خطأ أثناء تغيير حالة المهمة");
    } finally {
      setChangingStatus(prev => ({ ...prev, [taskId]: false }));
    }
  };

  return {
    handleStatusChange,
    changingStatus
  };
}
