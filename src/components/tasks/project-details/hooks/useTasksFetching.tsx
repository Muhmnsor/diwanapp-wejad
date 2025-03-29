
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksFetching = (
  projectId?: string, 
  meetingId?: string, 
  isWorkspace: boolean = false
) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let fetchedTasks: Task[] = [];

      if (isWorkspace && projectId) {
        // When isWorkspace is true and projectId is provided, we need to:
        // 1. Fetch the projects in this workspace
        // 2. For each project, fetch its tasks
        console.log("Fetching tasks for workspace:", projectId);
        
        // First, get all projects within this workspace
        const { data: workspaceProjects, error: projectsError } = await supabase
          .from('project_tasks')
          .select('id')
          .eq('workspace_id', projectId);
        
        if (projectsError) {
          console.error("Error fetching workspace projects:", projectsError);
          throw projectsError;
        }
        
        const projectIds = workspaceProjects.map(project => project.id);
        console.log("Found projects in workspace:", projectIds);
        
        if (projectIds.length > 0) {
          // Fetch tasks for all projects in the workspace
          const { data: projectTasks, error: tasksError } = await supabase
            .from('tasks')
            .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
            .in('project_id', projectIds);
          
          if (tasksError) {
            console.error("Error fetching project tasks:", tasksError);
            throw tasksError;
          }
          
          console.log(`Fetched ${projectTasks?.length || 0} tasks from workspace projects`);
          
          // Also fetch tasks directly associated with the workspace
          const { data: workspaceTasks, error: workspaceTasksError } = await supabase
            .from('tasks')
            .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
            .eq('workspace_id', projectId);
          
          if (workspaceTasksError) {
            console.error("Error fetching workspace tasks:", workspaceTasksError);
            throw workspaceTasksError;
          }
          
          console.log(`Fetched ${workspaceTasks?.length || 0} direct workspace tasks`);
          
          // Combine all tasks
          fetchedTasks = [...(projectTasks || []), ...(workspaceTasks || [])];
        } else {
          // No projects found, just fetch tasks associated directly with the workspace
          const { data, error } = await supabase
            .from('tasks')
            .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
            .eq('workspace_id', projectId);
          
          if (error) {
            console.error("Error fetching workspace tasks:", error);
            throw error;
          }
          
          fetchedTasks = data || [];
          console.log(`Fetched ${fetchedTasks.length} direct workspace tasks (no projects found)`);
        }
      } else if (meetingId) {
        // Fetch meeting tasks
        const { data, error } = await supabase
          .from('tasks')
          .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
          .eq('meeting_id', meetingId);
        
        if (error) {
          console.error("Error fetching meeting tasks:", error);
          throw error;
        }
        
        fetchedTasks = data || [];
        console.log(`Fetched ${fetchedTasks.length} meeting tasks`);
      } else if (projectId) {
        // Fetch project tasks
        const { data, error } = await supabase
          .from('tasks')
          .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
          .eq('project_id', projectId);
        
        if (error) {
          console.error("Error fetching project tasks:", error);
          throw error;
        }
        
        fetchedTasks = data || [];
        console.log(`Fetched ${fetchedTasks.length} project tasks`);
      } else {
        // General tasks (not associated with project, workspace, or meeting)
        const { data, error } = await supabase
          .from('tasks')
          .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)')
          .eq('is_general', true);
        
        if (error) {
          console.error("Error fetching general tasks:", error);
          throw error;
        }
        
        fetchedTasks = data || [];
        console.log(`Fetched ${fetchedTasks.length} general tasks`);
      }

      // Transform data to add user info and stage name
      const transformedTasks = fetchedTasks.map(task => ({
        ...task,
        assigned_user_name: task.profiles?.display_name || task.profiles?.email || '',
        stage_name: task.stage?.name || '',
      }));

      setTasks(transformedTasks);

      // Group tasks by stage for project tasks with stages
      if (projectId && !isWorkspace && !meetingId) {
        const groupedTasks: Record<string, Task[]> = {};
        transformedTasks.forEach(task => {
          if (task.stage_id) {
            if (!groupedTasks[task.stage_id]) {
              groupedTasks[task.stage_id] = [];
            }
            groupedTasks[task.stage_id].push(task);
          }
        });
        setTasksByStage(groupedTasks);
      }

      return transformedTasks;
    } catch (error) {
      console.error("Error in fetchTasks:", error);
      toast.error("حدث خطأ أثناء تحميل المهام");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, meetingId, isWorkspace]);

  return {
    tasks,
    isLoading,
    tasksByStage,
    setTasks,
    setTasksByStage,
    fetchTasks
  };
};
