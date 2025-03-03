
import { createContext, useContext, useState, ReactNode } from 'react';
import { Subtask } from '../types/subtask';
import { fetchSubtasks, addSubtask, updateSubtaskStatus, deleteSubtask } from '../services/subtasksService';
import { toast } from 'sonner';

interface SubtasksContextType {
  subtasks: Record<string, Subtask[]>;
  loadSubtasks: (taskId: string) => Promise<void>;
  addNewSubtask: (taskId: string, title: string, dueDate?: string, assignedTo?: string) => Promise<void>;
  updateStatus: (subtaskId: string, taskId: string, newStatus: string) => Promise<void>;
  removeSubtask: (subtaskId: string, taskId: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const SubtasksContext = createContext<SubtasksContextType | null>(null);

export const useSubtasks = () => {
  const context = useContext(SubtasksContext);
  if (!context) {
    throw new Error('useSubtasks must be used within a SubtasksProvider');
  }
  return context;
};

export const SubtasksProvider = ({ children }: { children: ReactNode }) => {
  const [subtasks, setSubtasks] = useState<Record<string, Subtask[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSubtasks = async (taskId: string) => {
    if (!taskId) return;
    
    setIsLoading(true);
    setError(null);
    
    const { data, error } = await fetchSubtasks(taskId);
    
    if (error) {
      setError(error);
    } else {
      setSubtasks(prev => ({ ...prev, [taskId]: data }));
    }
    
    setIsLoading(false);
  };

  const addNewSubtask = async (taskId: string, title: string, dueDate?: string, assignedTo?: string) => {
    setIsLoading(true);
    
    const { success, error } = await addSubtask(taskId, title, dueDate, assignedTo);
    
    if (success) {
      await loadSubtasks(taskId);
      toast.success("تمت إضافة المهمة الفرعية");
    } else if (error) {
      toast.error(error);
      setError(error);
    }
    
    setIsLoading(false);
  };

  const updateStatus = async (subtaskId: string, taskId: string, newStatus: string) => {
    const { success, error } = await updateSubtaskStatus(subtaskId, newStatus);
    
    if (success) {
      setSubtasks(prev => {
        const taskSubtasks = prev[taskId] || [];
        return {
          ...prev,
          [taskId]: taskSubtasks.map(subtask => 
            subtask.id === subtaskId 
              ? { ...subtask, status: newStatus } 
              : subtask
          )
        };
      });
      
      toast.success(newStatus === 'completed' 
        ? "تم إكمال المهمة الفرعية" 
        : "تم تحديث حالة المهمة الفرعية");
    } else if (error) {
      toast.error(error);
    }
  };

  const removeSubtask = async (subtaskId: string, taskId: string) => {
    const { success, error } = await deleteSubtask(subtaskId);
    
    if (success) {
      setSubtasks(prev => {
        const taskSubtasks = prev[taskId] || [];
        return {
          ...prev,
          [taskId]: taskSubtasks.filter(subtask => subtask.id !== subtaskId)
        };
      });
      
      toast.success("تم حذف المهمة الفرعية");
    } else if (error) {
      toast.error(error);
    }
  };

  return (
    <SubtasksContext.Provider 
      value={{ 
        subtasks, 
        loadSubtasks, 
        addNewSubtask, 
        updateStatus, 
        removeSubtask, 
        isLoading, 
        error 
      }}
    >
      {children}
    </SubtasksContext.Provider>
  );
};
