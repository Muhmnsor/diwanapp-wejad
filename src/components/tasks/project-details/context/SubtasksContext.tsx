
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import { Subtask } from '../types/subtask';
import { fetchSubtasks, addSubtask, updateSubtaskStatus, deleteSubtask } from '../services/subtasksService';

interface SubtasksContextType {
  subtasks: Record<string, Subtask[]>;
  isLoading: boolean;
  error: string | null;
  loadSubtasks: (taskId: string) => Promise<void>;
  addNewSubtask: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  updateStatus: (subtaskId: string, taskId: string, newStatus: string) => Promise<void>;
  removeSubtask: (subtaskId: string, taskId: string) => Promise<void>;
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
      const { data, error } = await fetchSubtasks(taskId);
      if (error) {
        setError(error);
      } else {
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
      const { success, error } = await addSubtask(taskId, title, dueDate, assignedTo);
      
      if (success) {
        await loadSubtasks(taskId);
        toast.success('تمت إضافة المهمة الفرعية بنجاح');
      } else if (error) {
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
        toast.error(error);
      }
    } catch (err) {
      console.error('Error updating subtask status:', err);
      toast.error('فشل في تحديث حالة المهمة الفرعية');
    }
  };

  const removeSubtask = async (subtaskId: string, taskId: string) => {
    try {
      const { success, error } = await deleteSubtask(subtaskId);
      
      if (success) {
        setSubtasks(prev => {
          const taskSubtasks = prev[taskId] || [];
          const updatedSubtasks = taskSubtasks.filter(subtask => subtask.id !== subtaskId);
          
          return { ...prev, [taskId]: updatedSubtasks };
        });
        
        toast.success('تم حذف المهمة الفرعية بنجاح');
      } else if (error) {
        toast.error(error);
      }
    } catch (err) {
      console.error('Error removing subtask:', err);
      toast.error('فشل في حذف المهمة الفرعية');
    }
  };

  const value: SubtasksContextType = {
    subtasks,
    isLoading,
    error,
    loadSubtasks,
    addNewSubtask,
    updateStatus,
    removeSubtask
  };

  return (
    <SubtasksContext.Provider value={value}>
      {children}
    </SubtasksContext.Provider>
  );
};
