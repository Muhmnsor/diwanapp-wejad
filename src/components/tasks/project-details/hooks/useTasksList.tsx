
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export function useTasksList(projectId: string | undefined) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [projectStages, setProjectStages] = useState<string[]>([]);
  
  // رسم مصفوفة للمهام حسب المرحلة
  const tasksByStage = tasks.reduce((acc: Record<string, Task[]>, task) => {
    if (task.stage) {
      if (!acc[task.stage]) {
        acc[task.stage] = [];
      }
      acc[task.stage].push(task);
    }
    return acc;
  }, {});
  
  const fetchTasks = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    
    try {
      // جلب المهام من قاعدة البيانات
      const { data, error } = await supabase
        .from('project_task_items')
        .select(`
          *,
          assigned_user:assigned_to (id, display_name, email)
        `)
        .eq('project_id', projectId)
        .eq('is_subtask', false)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // تنسيق البيانات لواجهة المستخدم
      const formattedTasks = data.map(task => ({
        ...task,
        assigned_user_name: task.assigned_user?.display_name || task.assigned_user?.email || null
      }));
      
      setTasks(formattedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("حدث خطأ أثناء جلب المهام");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);
  
  // جلب مراحل المشروع
  const fetchProjectStages = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_task_stages')
        .select('name')
        .eq('project_id', projectId)
        .order('order', { ascending: true });
        
      if (error) throw error;
      
      setProjectStages(data.map(stage => stage.name));
    } catch (error) {
      console.error("Error fetching project stages:", error);
    }
  }, [projectId]);
  
  // تنفيذ الاستعلامات عند تحميل المكون
  useEffect(() => {
    fetchTasks();
    fetchProjectStages();
  }, [fetchTasks, fetchProjectStages]);
  
  // معالجة تغيير مراحل المشروع
  const handleStagesChange = () => {
    fetchProjectStages();
  };
  
  // معالجة تغيير حالة المهمة
  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      // تحديث حالة المهمة في قاعدة البيانات
      const { error } = await supabase
        .from('project_task_items')
        .update({ status: newStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // تحديث حالة المهمة في واجهة المستخدم
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId ? { ...task, status: newStatus } : task
        )
      );
      
      toast.success("تم تحديث حالة المهمة بنجاح");
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("حدث خطأ أثناء تحديث حالة المهمة");
    }
  };
  
  // معالجة حذف المهمة
  const handleTaskDeleted = () => {
    fetchTasks(); // إعادة تحميل المهام بعد الحذف
  };
  
  // معالجة تعديل المهمة
  const handleTaskEdit = (taskId: string) => {
    toast.info("سيتم تنفيذ تعديل المهمة قريبًا");
    // في المستقبل سيتم فتح مربع حوار التعديل هنا
  };
  
  return {
    tasks,
    isLoading,
    activeTab,
    setActiveTab,
    isAddDialogOpen,
    setIsAddDialogOpen,
    projectStages,
    handleStagesChange,
    tasksByStage,
    handleStatusChange,
    fetchTasks,
    onTaskDeleted: handleTaskDeleted,
    onTaskEdit: handleTaskEdit
  };
}
