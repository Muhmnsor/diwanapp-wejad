
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { Subtask } from '../types/subtask';
import { fetchSubtasks, addSubtask, updateSubtaskStatus, deleteSubtask, updateSubtask } from '../services/subtasksService';

interface SubtasksContextType {
  subtasks: Record<string, Subtask[]>;
  isLoading: boolean;
  error: string | null;
  loadSubtasks: (taskId: string) => Promise<void>;
  addNewSubtask: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  updateStatus: (subtaskId: string, taskId: string, newStatus: string) => Promise<void>;
  removeSubtask: (subtaskId: string, taskId: string) => Promise<void>;
  updateSubtask: (subtaskId: string, taskId: string, updateData: Partial<Subtask>) => Promise<void>;
}

const SubtasksContext = createContext<SubtasksContextType | null>(null);

export const useSubtasks = () => {
  const context = useContext(SubtasksContext);
  return context;
};

interface SubtasksProviderProps {
  children: ReactNode;
}

export const SubtasksProvider: React.FC<SubtasksProviderProps> = ({ children }) => {
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubtasks = async (taskId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log(`Loading subtasks for task ${taskId}...`);
      const { data, error } = await fetchSubtasks(taskId);
      if (error) {
        console.error(`Error loading subtasks for task ${taskId}:`, error);
        setError(error);
      } else {
        console.log(`Successfully loaded ${data.length} subtasks for task ${taskId}`);
        setSubtasks(prev => ({ ...prev, [taskId]: data }));
      }
    } catch (err) {
      console.error('Error loading subtasks:', err);
      setError('فشل في تحميل المهام الفرعية');
    } finally {
      setIsLoading(false);
    }
  };

  const addNewSubtask = async (taskId: string, title: string, dueDate?: string, assignedTo?: string) => {
    setIsLoading(true);
    
    try {
      console.log(`Adding new subtask to task ${taskId}: "${title}"`);
      const { success, error, newSubtask } = await addSubtask(taskId, title, dueDate, assignedTo);
      
      if (success && newSubtask) {
        console.log(`Successfully added subtask:`, newSubtask);
        setSubtasks(prev => {
          const taskSubtasks = [...(prev[taskId] || []), newSubtask];
          return { ...prev, [taskId]: taskSubtasks };
        });
        toast.success('تمت إضافة المهمة الفرعية بنجاح');
      } else if (error) {
        console.error(`Error adding subtask to task ${taskId}:`, error);
        toast.error(error);
      }
    } catch (err) {
      console.error('Error adding subtask:', err);
      toast.error('فشل في إضافة المهمة الفرعية');
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (subtaskId: string, taskId: string, newStatus: string) => {
    try {
      console.log(`Updating status of subtask ${subtaskId} to ${newStatus}`);
      
      // Find the original subtask for potential rollback
      const originalSubtasks = subtasks[taskId] || [];
      const originalSubtask = originalSubtasks.find(s => s.id === subtaskId);
      
      if (!originalSubtask) {
        console.error(`Subtask ${subtaskId} not found for task ${taskId}`);
        return;
      }
      
      const originalStatus = originalSubtask.status;
      
      // Optimistically update the UI
      setSubtasks(prev => {
        const taskSubtasks = prev[taskId] || [];
        const updatedSubtasks = taskSubtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
        );
        
        return { ...prev, [taskId]: updatedSubtasks };
      });
      
      // Now perform the actual API call
      const { success, error } = await updateSubtaskStatus(subtaskId, newStatus);
      
      if (success) {
        toast.success(newStatus === 'completed' 
          ? 'تم إكمال المهمة الفرعية'
          : 'تم تحديث حالة المهمة الفرعية'
        );
      } else if (error) {
        console.error(`Error updating subtask ${subtaskId} status:`, error);
        toast.error(error);
        
        // Rollback UI changes on error
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const rollbackSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, status: originalStatus } : subtask
          );
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    } catch (err) {
      console.error('Error updating subtask status:', err);
      toast.error('فشل في تحديث حالة المهمة الفرعية');
      
      // Find the original subtask again to ensure it's in scope for the rollback
      const originalSubtasks = subtasks[taskId] || [];
      const originalSubtask = originalSubtasks.find(s => s.id === subtaskId);
      
      if (originalSubtask) {
        // Rollback UI changes on exception
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const rollbackSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, status: originalSubtask.status } : subtask
          );
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    }
  };

  const removeSubtask = async (subtaskId: string, taskId: string) => {
    try {
      console.log(`Removing subtask ${subtaskId} from task ${taskId}`);
      
      // Store the original subtask for potential rollback
      const originalSubtasks = subtasks[taskId] || [];
      const subtaskToRemove = originalSubtasks.find(s => s.id === subtaskId);
      
      if (!subtaskToRemove) {
        console.error(`Subtask ${subtaskId} not found for deletion`);
        return;
      }
      
      // Optimistically update the UI
      setSubtasks(prev => {
        const taskSubtasks = prev[taskId] || [];
        const updatedSubtasks = taskSubtasks.filter(subtask => subtask.id !== subtaskId);
        
        return { ...prev, [taskId]: updatedSubtasks };
      });
      
      // Now perform the actual API call
      const { success, error } = await deleteSubtask(subtaskId);
      
      if (success) {
        toast.success('تم حذف المهمة الفرعية بنجاح');
      } else if (error) {
        console.error(`Error removing subtask ${subtaskId}:`, error);
        toast.error(error);
        
        // Rollback UI changes on error
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          // Add the removed subtask back to the list
          const rollbackSubtasks = [...taskSubtasks, subtaskToRemove];
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    } catch (err) {
      console.error('Error removing subtask:', err);
      toast.error('فشل في حذف المهمة الفرعية');
      
      // Get the subtask to remove again to ensure it's in scope
      const originalSubtasks = subtasks[taskId] || [];
      const subtaskToRemove = originalSubtasks.find(s => s.id === subtaskId);
      
      if (subtaskToRemove) {
        // Rollback UI changes on exception
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const rollbackSubtasks = [...taskSubtasks, subtaskToRemove];
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    }
  };

  const updateSubtaskHandler = async (subtaskId: string, taskId: string, updateData: Partial<Subtask>) => {
    try {
      console.log(`Updating subtask ${subtaskId} with data:`, updateData);
      
      // Find the original subtask for potential rollback
      const originalSubtasks = subtasks[taskId] || [];
      const originalSubtask = originalSubtasks.find(s => s.id === subtaskId);
      
      if (!originalSubtask) {
        console.error(`Subtask ${subtaskId} not found for update`);
        return;
      }
      
      // Optimistically update the UI
      setSubtasks(prev => {
        const taskSubtasks = prev[taskId] || [];
        const updatedSubtasks = taskSubtasks.map(subtask => 
          subtask.id === subtaskId ? { ...subtask, ...updateData } : subtask
        );
        
        return { ...prev, [taskId]: updatedSubtasks };
      });
      
      // Now perform the actual API call
      const { success, error, updatedSubtask } = await updateSubtask(subtaskId, updateData);
      
      if (success && updatedSubtask) {
        // No need to update state again as we already did it optimistically
        toast.success('تم تحديث المهمة الفرعية بنجاح');
      } else if (error) {
        console.error(`Error updating subtask ${subtaskId}:`, error);
        toast.error(error);
        
        // Rollback UI changes on error
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const rollbackSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? originalSubtask : subtask
          );
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
      toast.error('فشل في تحديث المهمة الفرعية');
      
      // Get the original subtask again to ensure it's in scope
      const originalSubtasks = subtasks[taskId] || [];
      const originalSubtask = originalSubtasks.find(s => s.id === subtaskId);
      
      if (originalSubtask) {
        // Rollback UI changes on exception
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const rollbackSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? originalSubtask : subtask
          );
          
          return { ...prev, [taskId]: rollbackSubtasks };
        });
      }
    }
  };

  const value: SubtasksContextType = {
    subtasks,
    isLoading,
    error,
    loadSubtasks,
    addNewSubtask,
    updateStatus,
    removeSubtask,
    updateSubtask: updateSubtaskHandler
  };

  return (
    <SubtasksContext.Provider value={value}>
      {children}
    </SubtasksContext.Provider>
  );
};
