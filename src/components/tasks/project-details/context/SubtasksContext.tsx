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
      const { success, error } = await updateSubtaskStatus(subtaskId, newStatus);
      
      if (success) {
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const updatedSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? { ...subtask, status: newStatus } : subtask
          );
          
          return { ...prev, [taskId]: updatedSubtasks };
        });
        
        toast.success(newStatus === 'completed' 
          ? 'تم إكمال المهمة الفرعية'
          : 'تم تحديث حالة المهمة الفرعية'
        );
      } else if (error) {
        console.error(`Error updating subtask ${subtaskId} status:`, error);
        toast.error(error);
      }
    } catch (err) {
      console.error('Error updating subtask status:', err);
      toast.error('فشل في تحديث حالة المهمة الفرعية');
    }
  };

  const removeSubtask = async (subtaskId: string, taskId: string) => {
    try {
      console.log(`Removing subtask ${subtaskId} from task ${taskId}`);
      const { success, error } = await deleteSubtask(subtaskId);
      
      if (success) {
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const updatedSubtasks = taskSubtasks.filter(subtask => subtask.id !== subtaskId);
          
          return { ...prev, [taskId]: updatedSubtasks };
        });
        
        toast.success('تم حذف المهمة الفرعية بنجاح');
      } else if (error) {
        console.error(`Error removing subtask ${subtaskId}:`, error);
        toast.error(error);
      }
    } catch (err) {
      console.error('Error removing subtask:', err);
      toast.error('فشل في حذف المهمة الفرعية');
    }
  };

  const updateSubtaskHandler = async (subtaskId: string, taskId: string, updateData: Partial<Subtask>): Promise<void> => {
    try {
      console.log(`Updating subtask ${subtaskId} with data:`, updateData);
      const { success, error, updatedSubtask } = await updateSubtask(subtaskId, updateData);
      
      if (success && updatedSubtask) {
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const updatedSubtasks = taskSubtasks.map(subtask => 
            subtask.id === subtaskId ? updatedSubtask : subtask
          );
          
          return { ...prev, [taskId]: updatedSubtasks };
        });
        
        toast.success('تم تحديث المهمة الفرعية بنجاح');
      } else if (error) {
        console.error(`Error updating subtask ${subtaskId}:`, error);
        toast.error(error);
      }
    } catch (err) {
      console.error('Error updating subtask:', err);
      toast.error('فشل في تحديث المهمة الفرعية');
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
