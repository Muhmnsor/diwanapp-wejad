
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
      console.log("Fetching tasks with params:", { projectId, meetingId, isWorkspace });
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to (display_name, email)
        `);

      // Filter based on what's provided - using clear logic for each task type
      if (isWorkspace && projectId) {
        // Case 1: Workspace tasks - specific to a workspace
        console.log("Fetching workspace tasks for workspace ID:", projectId);
        query = query.eq('workspace_id', projectId);
      } else if (meetingId) {
        // Case 2: Meeting tasks - tied to a specific meeting
        console.log("Fetching meeting tasks for meeting ID:", meetingId);
        query = query.eq('meeting_id', meetingId);
      } else if (projectId) {
        // Case 3: Project tasks - specific to a project
        console.log("Fetching project tasks for project ID:", projectId);
        query = query.eq('project_id', projectId);
      } else {
        // Case 4: General tasks - not tied to any specific entity
        console.log("Fetching general tasks");
        query = query.eq('is_general', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Fetched tasks raw data:", data);

      // Transform data to add user info and stage name
      const transformedTasks = data.map(task => {
        // Add proper debugging for assigned user
        console.log("Task ID:", task.id);
        console.log("Task title:", task.title);
        console.log("Task assigned_to:", task.assigned_to);
        console.log("Task profiles:", task.profiles);

        // Safely extract the assigned user name
        let assignedUserName = '';
        if (task.profiles) {
          // Handle different response structures
          if (typeof task.profiles === 'object' && task.profiles !== null) {
            if (Array.isArray(task.profiles)) {
              // In some cases, it might be returned as an array
              assignedUserName = task.profiles[0]?.display_name || task.profiles[0]?.email || '';
            } else {
              // In most cases, it's returned as an object
              assignedUserName = task.profiles.display_name || task.profiles.email || '';
            }
          }
          console.log("Extracted assigned user name:", assignedUserName);
        }

        return {
          ...task,
          assigned_user_name: assignedUserName || 'غير محدد',
          stage_name: task.stage?.name || '',
        };
      });

      console.log("Transformed tasks with user names:", transformedTasks);

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
