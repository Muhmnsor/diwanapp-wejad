
import { Task } from "../types/task";
import { useState } from "react";
import { useSyncTaskStatus } from "@/hooks/tasks/useSyncTaskStatus";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useTaskStatusManagement = (
  projectId: string | undefined,
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  tasksByStage: Record<string, Task[]>,
  setTasksByStage: React.Dispatch<React.SetStateAction<Record<string, Task[]>>>
) => {
  const [updating, setUpdating] = useState<Record<string, boolean>>({});
  const { syncTaskStatus } = useSyncTaskStatus();

  const handleStatusChange = async (taskId: string, status: string) => {
    // Set updating state for this task
    setUpdating(prev => ({ ...prev, [taskId]: true }));
    
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Check if this is a general task with meeting task links
      // If so, use the sync function for bidirectional updates
      if (task.is_general) {
        await syncTaskStatus(taskId, status, {
          onSuccess: () => {
            toast.success("تم تحديث حالة المهمة");
            
            // Update local state to reflect the change
            setTasks(prevTasks =>
              prevTasks.map(t => (t.id === taskId ? { ...t, status } : t))
            );

            // Update tasksByStage if it exists
            if (Object.keys(tasksByStage).length > 0) {
              setTasksByStage(prev => {
                const newTasksByStage = { ...prev };
                
                // Loop through all stages to find and update the task
                for (const stageId in newTasksByStage) {
                  newTasksByStage[stageId] = newTasksByStage[stageId].map(t =>
                    t.id === taskId ? { ...t, status } : t
                  );
                }
                
                return newTasksByStage;
              });
            }
          },
          onError: (error) => {
            console.error("Error updating task status:", error);
            toast.error("حدث خطأ أثناء تحديث حالة المهمة");
          }
        });
      } else {
        // Regular update for tasks without links
        const { error } = await supabase
          .from("tasks")
          .update({ status })
          .eq("id", taskId);

        if (error) throw error;

        // Update local state to reflect the change
        setTasks(prevTasks =>
          prevTasks.map(t => (t.id === taskId ? { ...t, status } : t))
        );

        // Update tasksByStage if it exists
        if (Object.keys(tasksByStage).length > 0) {
          setTasksByStage(prev => {
            const newTasksByStage = { ...prev };
            
            // Loop through all stages to find and update the task
            for (const stageId in newTasksByStage) {
              newTasksByStage[stageId] = newTasksByStage[stageId].map(t =>
                t.id === taskId ? { ...t, status } : t
              );
            }
            
            return newTasksByStage;
          });
        }

        toast.success("تم تحديث حالة المهمة");
      }
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    } finally {
      // Clear updating state for this task
      setUpdating(prev => ({ ...prev, [taskId]: false }));
    }
  };

  return { handleStatusChange, updating };
};
