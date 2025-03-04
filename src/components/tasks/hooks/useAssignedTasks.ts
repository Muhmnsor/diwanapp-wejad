
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useAssignedTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        setError(new Error("المستخدم غير مسجل دخوله"));
        setLoading(false);
        return;
      }
      
      // استرجاع المهام من مختلف الجداول
      const [regularTasks, portfolioTasks, subtasks] = await Promise.all([
        fetchRegularTasks(userId),
        fetchPortfolioTasks(userId),
        fetchSubtasks(userId)
      ]);
      
      // جمع المهام والتعامل مع معلومات المشاريع والمهام الرئيسية
      const projectIds = [...regularTasks, ...portfolioTasks]
        .filter(task => task.project_id)
        .map(task => task.project_id as string);
      
      const parentTaskIds = subtasks
        .filter(task => task.task_id)
        .map(task => task.task_id as string);
      
      const [projectsMap, parentTasksMap] = await Promise.all([
        fetchProjectDetails(projectIds),
        fetchParentTasks(parentTaskIds)
      ]);
      
      // تنسيق المهام
      const formattedRegularTasks = regularTasks.map(task => ({
        ...task,
        project_name: task.project_id ? projectsMap[task.project_id] : undefined
      }));
      
      // تنسيق المهام الفرعية
      const formattedSubtasks = subtasks.map(task => {
        const parentInfo = task.task_id ? parentTasksMap[task.task_id] : undefined;
        return {
          ...task,
          is_subtask: true,
          parent_task_id: task.task_id,
          project_name: parentInfo?.project_name,
          workspace_name: parentInfo?.workspace_name
        };
      });
      
      // تنسيق مهام المحفظة
      const formattedPortfolioTasks = portfolioTasks.map(task => {
        const projectName = task.portfolio_only_projects && Array.isArray(task.portfolio_only_projects) && 
                          task.portfolio_only_projects.length > 0 ? 
                          task.portfolio_only_projects[0].name : undefined;
        
        const workspaceName = task.portfolio_workspaces && Array.isArray(task.portfolio_workspaces) && 
                            task.portfolio_workspaces.length > 0 ? 
                            task.portfolio_workspaces[0].name : undefined;
        
        return {
          ...task,
          project_name: projectName,
          workspace_name: workspaceName
        };
      });
      
      // دمج جميع المهام
      const allTasks = [
        ...formattedRegularTasks,
        ...formattedPortfolioTasks,
        ...formattedSubtasks
      ];
      
      // ترتيب المهام حسب تاريخ الاستحقاق
      const sortedTasks = allTasks.sort((a, b) => {
        // المهام بدون تاريخ استحقاق تأتي في النهاية
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      });
      
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setError(error);
      toast.error("حدث خطأ أثناء استرجاع المهام");
    } finally {
      setLoading(false);
    }
  };
  
  // استرجاع المهام من جدول المهام العادية
  const fetchRegularTasks = async (userId: string): Promise<Task[]> => {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        status,
        due_date,
        priority,
        project_id
      `)
      .eq('assigned_to', userId);
    
    if (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
    
    return data || [];
  };
  
  // استرجاع المهام من جدول مهام المحفظة
  const fetchPortfolioTasks = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('portfolio_tasks')
      .select(`
        id,
        title,
        description,
        status,
        due_date,
        priority,
        workspace_id,
        portfolio_only_projects(name),
        portfolio_workspaces(name)
      `)
      .eq('assigned_to', userId);
    
    if (error) {
      console.error("Error fetching portfolio tasks:", error);
      throw error;
    }
    
    return data || [];
  };
  
  // استرجاع المهام الفرعية
  const fetchSubtasks = async (userId: string): Promise<any[]> => {
    const { data, error } = await supabase
      .from('subtasks')
      .select(`
        id,
        title,
        status,
        due_date,
        task_id
      `)
      .eq('assigned_to', userId);
    
    if (error) {
      console.error("Error fetching subtasks:", error);
      throw error;
    }
    
    return data || [];
  };
  
  // استرجاع بيانات المشاريع للمهام العادية
  const fetchProjectDetails = async (projectIds: string[]): Promise<Record<string, string>> => {
    if (projectIds.length === 0) return {};
    
    let projectsMap: Record<string, string> = {};
    
    // التحقق من جدول مهام المشاريع
    const { data: projectTasksData } = await supabase
      .from('project_tasks')
      .select('id, title')
      .in('id', projectIds);
      
    if (projectTasksData && projectTasksData.length > 0) {
      projectTasksData.forEach((project: any) => {
        projectsMap[project.id] = project.title;
      });
    }
    
    // التحقق من جدول المشاريع العام
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, title')
      .in('id', projectIds);
      
    if (projectsData && projectsData.length > 0) {
      projectsData.forEach((project: any) => {
        projectsMap[project.id] = project.title;
      });
    }
    
    return projectsMap;
  };
  
  // استرجاع بيانات المهام الرئيسية للمهام الفرعية
  const fetchParentTasks = async (taskIds: string[]): Promise<Record<string, any>> => {
    if (taskIds.length === 0) return {};
    
    const parentTasksMap: Record<string, any> = {};
    
    // التحقق من جدول المهام العادية
    const { data: parentTasks } = await supabase
      .from('tasks')
      .select('id, title, project_id')
      .in('id', taskIds);
      
    if (parentTasks && parentTasks.length > 0) {
      parentTasks.forEach((task: any) => {
        parentTasksMap[task.id] = {
          title: task.title,
          project_id: task.project_id
        };
      });
    }
    
    // التحقق من جدول مهام المحفظة
    const { data: portfolioParentTasks } = await supabase
      .from('portfolio_tasks')
      .select(`
        id, 
        title,
        portfolio_only_projects(name),
        portfolio_workspaces(name)
      `)
      .in('id', taskIds);
      
    if (portfolioParentTasks && portfolioParentTasks.length > 0) {
      portfolioParentTasks.forEach((task: any) => {
        let projectName = 'مشروع غير محدد';
        if (task.portfolio_only_projects && 
            Array.isArray(task.portfolio_only_projects) && 
            task.portfolio_only_projects.length > 0) {
          projectName = task.portfolio_only_projects[0].name;
        }
        
        let workspaceName = '';
        if (task.portfolio_workspaces && 
            Array.isArray(task.portfolio_workspaces) && 
            task.portfolio_workspaces.length > 0) {
          workspaceName = task.portfolio_workspaces[0].name;
        }
        
        parentTasksMap[task.id] = {
          title: task.title,
          project_name: projectName,
          workspace_name: workspaceName
        };
      });
    }
    
    return parentTasksMap;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks
  };
};
