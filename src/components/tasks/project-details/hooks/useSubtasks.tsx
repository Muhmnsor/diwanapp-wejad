import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Subtask } from "../types/task";

export const useSubtasks = (taskId: string) => {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubtasks = async () => {
    if (!taskId) return;
    
    setIsLoading(true);
    try {
      console.log("Fetching subtasks for task:", taskId);
      const { data, error } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('parent_task_id', taskId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      console.log("Fetched subtasks:", data);
      setSubtasks(data || []);
    } catch (error) {
      console.error("Error fetching subtasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام الفرعية");
    } finally {
      setIsLoading(false);
    }
  };

  const addSubtask = async (title: string, dueDate: string, assignedTo: string) => {
    if (!taskId || !title.trim()) return;
    
    try {
      console.log("Adding subtask:", { taskId, title, dueDate, assignedTo });
      
      // Create object without the priority field since it doesn't exist in the database
      const newSubtask = { 
        parent_task_id: taskId, 
        title, 
        status: 'pending',
        due_date: dueDate || null,
        assigned_to: assignedTo || null
      };
      
      const { data, error } = await supabase
        .from('task_subtasks')
        .insert([newSubtask])
        .select();
      
      if (error) throw error;
      
      console.log("Subtask added successfully:", data[0]);
      setSubtasks([...subtasks, data[0]]);
      toast.success("تمت إضافة المهمة الفرعية بنجاح");
      return data[0];
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast.error("حدث خطأ أثناء إضافة المهمة الفرعية");
      throw error;
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, newStatus: string) => {
    try {
      console.log("Updating subtask status:", { subtaskId, newStatus });
      
      const { error } = await supabase
        .from('task_subtasks')
        .update({ status: newStatus })
        .eq('id', subtaskId);
      
      if (error) throw error;
      
      setSubtasks(subtasks.map(subtask => 
        subtask.id === subtaskId 
          ? { ...subtask, status: newStatus } 
          : subtask
      ));
      
      toast.success("تم تحديث حالة المهمة الفرعية بنجاح");
    } catch (error) {
      console.error("Error updating subtask status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة الفرعية");
      throw error;
    }
  };

  const deleteSubtask = async (subtaskId: string) => {
    try {
      console.log("Deleting subtask:", subtaskId);
      
      const { error } = await supabase
        .from('task_subtasks')
        .delete()
        .eq('id', subtaskId);
      
      if (error) throw error;
      
      setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
      toast.success("تم حذف المهمة الفرعية بنجاح");
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast.error("حدث خطأ أثناء حذف المهمة الفرعية");
      throw error;
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    }
  }, [taskId]);

  return {
    subtasks,
    isLoading,
    addSubtask,
    updateSubtaskStatus,
    deleteSubtask,
    refreshSubtasks: fetchSubtasks
  };
};
