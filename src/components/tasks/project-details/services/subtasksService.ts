
import { supabase } from "@/integrations/supabase/client";
import { Subtask } from "../types/subtask";
import { toast } from "sonner";

export const fetchSubtasks = async (taskId: string): Promise<{ data: Subtask[], error: string | null }> => {
  try {
    // First check if the subtasks table exists
    const { error: tableCheckError } = await supabase
      .from('subtasks')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (tableCheckError) {
      // Table doesn't exist
      if (tableCheckError.code === '42P01') {
        return { data: [], error: null };
      }
      return { data: [], error: "حدث خطأ أثناء التحقق من جدول المهام الفرعية" };
    }
    
    const { data, error } = await supabase
      .from('subtasks')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Add user names for subtasks with assignees
    const subtasksWithUserData = await Promise.all((data || []).map(async (subtask) => {
      if (subtask.assigned_to) {
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('display_name, email')
          .eq('id', subtask.assigned_to)
          .single();
        
        if (!userError && userData) {
          return {
            ...subtask,
            assigned_user_name: userData.display_name || userData.email
          };
        }
      }
      
      return subtask;
    }));
    
    return { data: subtasksWithUserData, error: null };
  } catch (error) {
    console.error("Error fetching subtasks:", error);
    return { data: [], error: "لا يمكن تحميل المهام الفرعية حالياً" };
  }
};

export const addSubtask = async (
  taskId: string, 
  title: string, 
  dueDate?: string, 
  assignedTo?: string
): Promise<{ success: boolean, error: string | null, newSubtask?: Subtask }> => {
  try {
    // Check if the subtasks table exists
    const { error: tableCheckError } = await supabase
      .from('subtasks')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      // Table doesn't exist
      return { 
        success: false, 
        error: "خاصية المهام الفرعية غير متوفرة حالياً، يرجى الاتصال بالمسؤول" 
      };
    }
    
    const subtaskData = {
      task_id: taskId,
      title,
      status: 'pending',
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      assigned_to: assignedTo && assignedTo !== 'none' ? assignedTo : null
    };
    
    const { data, error } = await supabase
      .from('subtasks')
      .insert([subtaskData])
      .select('*')
      .single();
    
    if (error) throw error;
    
    // If there's an assignee, get their name
    let newSubtask = data as Subtask;
    
    if (newSubtask.assigned_to) {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', newSubtask.assigned_to)
        .single();
      
      if (!userError && userData) {
        newSubtask = {
          ...newSubtask,
          assigned_user_name: userData.display_name || userData.email
        };
      }
    }
    
    return { success: true, error: null, newSubtask };
  } catch (error) {
    console.error("Error adding subtask:", error);
    return { success: false, error: "حدث خطأ أثناء إضافة المهمة الفرعية" };
  }
};

export const updateSubtaskStatus = async (
  subtaskId: string, 
  newStatus: string
): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('subtasks')
      .update({ status: newStatus })
      .eq('id', subtaskId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating subtask status:", error);
    return { success: false, error: "حدث خطأ أثناء تحديث حالة المهمة الفرعية" };
  }
};

export const deleteSubtask = async (
  subtaskId: string
): Promise<{ success: boolean, error: string | null }> => {
  try {
    const { error } = await supabase
      .from('subtasks')
      .delete()
      .eq('id', subtaskId);
    
    if (error) throw error;
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting subtask:", error);
    return { success: false, error: "حدث خطأ أثناء حذف المهمة الفرعية" };
  }
};

export const checkPendingSubtasks = async (
  taskId: string
): Promise<{ hasPendingSubtasks: boolean, error: string | null }> => {
  try {
    // Check if the subtasks table exists
    const { error: tableCheckError } = await supabase
      .from('subtasks')
      .select('count')
      .limit(1)
      .maybeSingle();
    
    if (tableCheckError) {
      // Table doesn't exist, so no pending subtasks
      if (tableCheckError.code === '42P01') {
        return { hasPendingSubtasks: false, error: null };
      }
      return { hasPendingSubtasks: false, error: "حدث خطأ أثناء التحقق من المهام الفرعية" };
    }
    
    // Check for pending subtasks
    const { data, error, count } = await supabase
      .from('subtasks')
      .select('id', { count: 'exact' })
      .eq('task_id', taskId)
      .neq('status', 'completed');
    
    if (error) throw error;
    
    return { 
      hasPendingSubtasks: count !== null && count > 0, 
      error: null 
    };
  } catch (error) {
    console.error("Error checking pending subtasks:", error);
    return { hasPendingSubtasks: false, error: "حدث خطأ أثناء التحقق من المهام الفرعية" };
  }
};
