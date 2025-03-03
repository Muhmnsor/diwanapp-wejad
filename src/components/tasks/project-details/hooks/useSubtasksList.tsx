import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Subtask } from "../types/subtask";
import { useSubtasks } from "../context/SubtasksContext";
import { 
  fetchSubtasks, 
  addSubtask, 
  updateSubtaskStatus, 
  deleteSubtask 
} from "../services/subtasksService";

export const useSubtasksList = (
  taskId: string,
  externalSubtasks?: Subtask[],
  externalAddSubtask?: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>,
  externalUpdateStatus?: (subtaskId: string, newStatus: string) => Promise<void>,
  externalDeleteSubtask?: (subtaskId: string) => Promise<void>
) => {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Try to use the context if available
  const subtasksContext = useSubtasks();
  
  useEffect(() => {
    if (externalSubtasks) {
      setSubtasks(externalSubtasks);
    } else {
      fetchSubtasksData();
    }
  }, [taskId, externalSubtasks]);
  
  const fetchSubtasksData = async () => {
    if (!taskId) return;
    
    // If we have context and no external subtasks, use that
    if (subtasksContext && !externalSubtasks) {
      await subtasksContext.loadSubtasks(taskId);
      return;
    }
    
    // Otherwise, fetch directly
    setIsLoading(true);
    setError(null);
    const { data, error } = await fetchSubtasks(taskId);
    setSubtasks(data);
    setError(error);
    setIsLoading(false);
  };
  
  const handleAddSubtask = async (title: string, dueDate?: string, assignedTo?: string) => {
    if (externalAddSubtask) {
      try {
        await externalAddSubtask(taskId, title, dueDate, assignedTo);
        setIsAddingSubtask(false);
      } catch (error) {
        console.error("Error adding subtask:", error);
        toast.error("حدث خطأ أثناء إضافة المهمة الفرعية");
      }
    } else if (subtasksContext) {
      try {
        await subtasksContext.addNewSubtask(taskId, title, dueDate, assignedTo);
        setIsAddingSubtask(false);
      } catch (error) {
        console.error("Error adding subtask via context:", error);
      }
    } else {
      setIsLoading(true);
      const { success, error } = await addSubtask(taskId, title, dueDate, assignedTo);
      
      if (success) {
        toast.success("تمت إضافة المهمة الفرعية");
        await fetchSubtasksData();
      } else if (error) {
        toast.error(error);
      }
      
      setIsLoading(false);
      setIsAddingSubtask(false);
    }
  };
  
  const handleUpdateStatus = async (subtaskId: string, newStatus: string) => {
    if (externalUpdateStatus) {
      await externalUpdateStatus(subtaskId, newStatus);
    } else if (subtasksContext) {
      await subtasksContext.updateStatus(subtaskId, taskId, newStatus);
    } else {
      const { success, error } = await updateSubtaskStatus(subtaskId, newStatus);
      
      if (success) {
        setSubtasks(prevSubtasks => 
          prevSubtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus } 
              : subtask
          )
        );
        
        toast.success(newStatus === 'completed' 
          ? "تم إكمال المهمة الفرعية" 
          : "تم تحديث حالة المهمة الفرعية");
      } else if (error) {
        toast.error(error);
      }
    }
  };
  
  const handleDeleteSubtask = async (subtaskId: string) => {
    if (externalDeleteSubtask) {
      await externalDeleteSubtask(subtaskId);
    } else if (subtasksContext) {
      await subtasksContext.removeSubtask(subtaskId, taskId);
    } else {
      const { success, error } = await deleteSubtask(subtaskId);
      
      if (success) {
        setSubtasks(prevSubtasks => 
          prevSubtasks.filter(subtask => subtask.id !== subtaskId)
        );
        
        toast.success("تم حذف المهمة الفرعية");
      } else if (error) {
        toast.error(error);
      }
    }
  };

  // Get subtasks from context if available and no external subtasks
  const displaySubtasks = externalSubtasks || 
    (subtasksContext && subtasksContext.subtasks[taskId]) || 
    subtasks;

  // Use context loading state if available
  const displayLoading = subtasksContext ? subtasksContext.isLoading : isLoading;
  
  // Use context error state if available
  const displayError = subtasksContext ? subtasksContext.error : error;

  return {
    subtasks: displaySubtasks,
    isLoading: displayLoading,
    error: displayError,
    isAddingSubtask,
    setIsAddingSubtask,
    handleAddSubtask,
    handleUpdateStatus,
    handleDeleteSubtask
  };
};
