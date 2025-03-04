
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
      
      // 1. استرجاع المشاريع الخاصة بالمستخدم وتخزينها في قاموس
      const { data: projectsData } = await supabase
        .from('project_tasks')
        .select('id, title');
      
      console.log("Projects data:", projectsData);
        
      if (projectsData) {
        projectsData.forEach(project => {
          if (project.id && project.title) {
            projects[project.id] = project.title;
          }
        });
      }
      
      console.log("Projects map:", projects);
      
      // 2. استرجاع مهام المحفظة المسندة إلى المستخدم
      const { data: portfolioTasks, error: portfolioError } = await supabase
        .from('portfolio_tasks')
        .select(`
          id, title, description, status, priority, due_date,
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
          parentTasks[task.id] = task;
        });
        
        const transformedPortfolioTasks = transformPortfolioTasks(portfolioTasks || []);
        
        // 3. استرجاع المهام العادية المسندة إلى المستخدم
        const { data: regularTasks, error: regularError } = await supabase
          .from('tasks')
          .select('*')
          .eq('assigned_to', userId);
          
        if (regularError) {
          console.error("Error fetching regular tasks:", regularError);
        } else {
          console.log("Regular tasks fetched:", regularTasks);
          
          // تخزين المهام الأساسية للرجوع إليها لاحقًا
          regularTasks?.forEach(task => {
            parentTasks[task.id] = task;
          });
          
          const transformedRegularTasks = transformRegularTasks(regularTasks || [], projects);
          
          // 4. استرجاع المهام الفرعية المسندة إلى المستخدم
          const { data: subtasks, error: subtasksError } = await supabase
            .from('subtasks')
            .select('*')
            .eq('assigned_to', userId);
            
          if (subtasksError) {
            console.error("Error fetching subtasks:", subtasksError);
          } else {
            console.log("Subtasks fetched:", subtasks);
            
            const transformedSubtasks = transformSubtasks(subtasks || [], parentTasks, projects);
            
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
              project_id: t.project_id
            })));
            
            setTasks(allTasks);
          }
        }
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
