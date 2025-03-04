
import { useState, useEffect } from "react";
import { Task } from "./types/task";
import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { TaskListItem } from "./components/TaskListItem";
import { TasksLoadingState } from "./components/TasksLoadingState";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const AssignedTasksList = () => {
  const { tasks, loading, error, refetch } = useAssignedTasks();
  
  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      // التحقق من الجدول المناسب للمهمة
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      const isPortfolioTask = task.workspace_id ? true : false;
      const tableName = isPortfolioTask ? 'portfolio_tasks' : 'tasks';
      
      const { error } = await supabase
        .from(tableName)
        .update({ status })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // تحديث القائمة
      refetch();
      
      toast.success('تم تحديث حالة المهمة');
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error('حدث خطأ أثناء تحديث حالة المهمة');
    }
  };
  
  if (loading) {
    return <TasksLoadingState />;
  }
  
  if (error || tasks.length === 0) {
    return <TasksEmptyState message="لا توجد لديك مهام مسندة حالياً" />;
  }
  
  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskListItem 
          key={task.id} 
          task={task} 
          onStatusChange={handleStatusChange}
        />
      ))}
    </div>
  );
};
