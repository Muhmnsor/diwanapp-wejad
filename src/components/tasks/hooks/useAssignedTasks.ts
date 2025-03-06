
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { transformPortfolioTasks, transformRegularTasks, transformSubtasks } from "../utils/tasksTransformers";
import type { Task } from "../types/task";

export type { Task };

export const useAssignedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      console.log("Fetching tasks for user:", userId);
      
      const projects: Record<string, string> = {};
      const parentTasks: Record<string, any> = {};
      const validProjectIds: Set<string> = new Set();
      
      // 1. استرجاع المشاريع النشطة فقط وتخزينها في قاموس
      const { data: projectsData } = await supabase
        .from('project_tasks')
        .select('id, title');
        
      console.log("Projects data:", projectsData);
        
      if (projectsData) {
        projectsData.forEach(project => {
          if (project.id && project.title) {
            projects[project.id] = project.title;
            // تخزين معرفات المشاريع الصالحة
            validProjectIds.add(project.id);
          }
        });
      }
      
      console.log("Projects map:", projects);
      console.log("Valid project IDs:", Array.from(validProjectIds));
      
      // 2. استرجاع مهام المحفظة المسندة إلى المستخدم
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select(`
          id, title, description, status, priority, due_date, project_id,
          portfolio_only_projects (id, name),
          portfolio_workspaces (id, name)
        `)
        .eq('assigned_to', userId);
        
      if (portfolioError) {
        console.error("Error fetching portfolio tasks:", portfolioError);
      } else {
        console.log("Portfolio tasks fetched:", portfolioTasks);
        
        // تخزين المهام الأساسية للرجوع إليها لاحقًا
        portfolioTasks?.forEach(task => {
          parentTasks[task.id] = {
            ...task,
            project_name: task.portfolio_only_projects && task.portfolio_only_projects[0]?.name || null
          };
        });
      }
      
      // 3. استرجاع المهام العادية المسندة إلى المستخدم وفقط من المشاريع الموجودة
      const { data: regularTasks, error: regularError } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', userId);
        
      if (regularError) {
        console.error("Error fetching regular tasks:", regularError);
      } else {
        console.log("Regular tasks fetched:", regularTasks);
        
        // تصفية المهام التي تنتمي لمشاريع محذوفة
        const filteredRegularTasks = regularTasks?.filter(task => {
          // إذا كانت المهمة عامة أو لا تنتمي لأي مشروع، احتفظ بها
          if (task.is_general || !task.project_id) return true;
          
          // تحقق مما إذا كان معرف المشروع موجودًا في قائمة المشاريع الصالحة
          return validProjectIds.has(task.project_id);
        });
        
        console.log("Filtered regular tasks:", filteredRegularTasks?.length);
        
        // تخزين المهام الأساسية للرجوع إليها لاحقًا مع إضافة اسم المشروع
        filteredRegularTasks?.forEach(task => {
          const projectName = task.project_id && projects[task.project_id] ? projects[task.project_id] : null;
          parentTasks[task.id] = {
            ...task,
            project_name: projectName
          };
          console.log(`Stored parent task ${task.id} with project_name: ${projectName}`);
        });
        
        // استخدام المهام المفلترة
        regularTasks = filteredRegularTasks;
      }
      
      // 3.5 أيضًا جلب كل المهام للمساعدة في ربط المهام الفرعية بآبائها
      // هذا سيساعد في العثور على المهام الرئيسية التي قد لا تكون مسندة للمستخدم
      const { data: allTasks } = await supabase
        .from('tasks')
        .select('id, title, project_id');
        
      if (allTasks) {
        // تصفية المهام التي تنتمي لمشاريع محذوفة
        const filteredAllTasks = allTasks.filter(task => {
          if (!task.project_id) return true;
          return validProjectIds.has(task.project_id);
        });
        
        filteredAllTasks.forEach(task => {
          if (!parentTasks[task.id]) {
            const projectName = task.project_id && projects[task.project_id] ? projects[task.project_id] : null;
            parentTasks[task.id] = {
              id: task.id,
              title: task.title,
              project_id: task.project_id,
              project_name: projectName
            };
            console.log(`Stored additional parent task ${task.id} with project_name: ${projectName}`);
          }
        });
      }
      
      // 4. استرجاع المهام الفرعية المسندة إلى المستخدم
      const { data: subtasks, error: subtasksError } = await supabase
        .from('subtasks')
        .select('*')
        .eq('assigned_to', userId);
        
      if (subtasksError) {
        console.error("Error fetching subtasks:", subtasksError);
      } else {
        console.log("Subtasks fetched:", subtasks);
        
        // تصفية المهام الفرعية بناءً على ما إذا كانت المهمة الأساسية تنتمي لمشروع صالح
        const filteredSubtasks = subtasks?.filter(subtask => {
          const parentTask = parentTasks[subtask.task_id];
          if (!parentTask) return false; // لا نعرف المهمة الأساسية
          if (!parentTask.project_id) return true; // المهمة الأساسية ليست مرتبطة بمشروع
          
          return validProjectIds.has(parentTask.project_id);
        });
        
        console.log("Filtered subtasks:", filteredSubtasks?.length);
        
        // طباعة معلومات المهام الرئيسية للتأكد من توفر البيانات للمهام الفرعية
        if (filteredSubtasks && filteredSubtasks.length > 0) {
          filteredSubtasks.forEach(subtask => {
            const parentTaskInfo = parentTasks[subtask.task_id];
            console.log(`Subtask ${subtask.id} parent task info:`, 
              parentTaskInfo ? {
                id: parentTaskInfo.id,
                title: parentTaskInfo.title,
                project_id: parentTaskInfo.project_id,
                project_name: parentTaskInfo.project_name
              } : 'Parent task not found');
          });
        }
        
        const transformedPortfolioTasks = transformPortfolioTasks(portfolioTasks || []);
        const transformedRegularTasks = transformRegularTasks(regularTasks || [], projects);
        const transformedSubtasks = transformSubtasks(filteredSubtasks || [], parentTasks, projects);
        
        // 5. دمج المهام وترتيبها حسب تاريخ الاستحقاق
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
        
        console.log("All tasks with project names:", allTasks.map(t => ({
          id: t.id,
          title: t.title,
          project_name: t.project_name,
          project_id: t.project_id,
          is_subtask: t.is_subtask,
          parent_task_id: t.parent_task_id
        })));
        
        setTasks(allTasks);
      }
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
