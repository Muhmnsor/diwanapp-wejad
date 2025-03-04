
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { transformPortfolioTasks, transformRegularTasks, transformSubtasks } from "../utils/tasksTransformers";
import { Task } from "../types/task";

export { Task };

export const useAssignedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const projects: Record<string, string> = {};
      const parentTasks: Record<string, any> = {};
      
      // 1. استرجاع المشاريع الخاصة بالمستخدم وتخزينها في قاموس
      const { data: projectsData } = await supabase
        .from('project_tasks')
        .select('id, name')
        .eq('is_active', true);
        
      if (projectsData) {
        projectsData.forEach(project => {
          projects[project.id] = project.name;
        });
      }
      
      // 2. استرجاع مهام المحفظة المسندة إلى المستخدم
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select(`
          id, title, description, status, priority, due_date,
          portfolio_only_projects (id, name),
          portfolio_workspaces (id, name)
        `)
        .eq('assigned_to', supabase.auth.getUser().then(res => res.data.user?.id))
        .is('is_subtask', false);
        
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
      }
      
      // 3. استرجاع المهام العادية المسندة إلى المستخدم
      const { data: regularTasks, error: regularError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', supabase.auth.getUser().then(res => res.data.user?.id));
        
      if (regularError) {
        console.error("Error fetching regular tasks:", regularError);
      }
      
      // 4. تخزين المهام الأساسية للرجوع إليها لاحقًا
      const allParentTasks = [...(portfolioTasks || []), ...(regularTasks || [])];
      allParentTasks.forEach(task => {
        parentTasks[task.id] = task;
      });
      
      // 5. استرجاع المهام الفرعية المسندة إلى المستخدم
      const { data: subtasks, error: subtasksError } = await supabase
        .from('task_subtasks')
        .select('*')
        .eq('assigned_to', supabase.auth.getUser().then(res => res.data.user?.id));
        
      if (subtasksError) {
        console.error("Error fetching subtasks:", subtasksError);
      }
      
      // 6. تحويل البيانات إلى تنسيق موحد
      const transformedPortfolioTasks = transformPortfolioTasks(portfolioTasks || []);
      const transformedRegularTasks = transformRegularTasks(regularTasks || [], projects);
      const transformedSubtasks = transformSubtasks(subtasks || [], parentTasks, projects);
      
      // 7. دمج المهام وترتيبها حسب تاريخ الاستحقاق
      const allTasks = [
        ...transformedPortfolioTasks,
        ...transformedRegularTasks,
        ...transformedSubtasks
      ].sort((a, b) => {
        // المهام التي لها تاريخ استحقاق تأتي أولاً
        if (a.due_date && !b.due_date) return -1;
        if (!a.due_date && b.due_date) return 1;
        if (!a.due_date && !b.due_date) return 0;
        
        // ترتيب تصاعدي حسب تاريخ الاستحقاق
        return new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime();
      });
      
      setTasks(allTasks);
    } catch (err) {
      console.error("Error in useAssignedTasks:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };
  
  const refetch = () => {
    fetchTasks();
  };
  
  useEffect(() => {
    fetchTasks();
  }, []);
  
  return { tasks, loading, error, refetch };
};
