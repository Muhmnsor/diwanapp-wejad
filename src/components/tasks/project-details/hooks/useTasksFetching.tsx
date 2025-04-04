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
      
      // Improve the query to join with profiles table for assigned_to user
      let query = supabase
        .from('tasks')
        .select(`
          *,
          profiles:assigned_to (display_name, email),
          stage:stage_id (name)
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
        console.log("Task assigned_to:", task.assigned_to);
        console.log("Task profiles:", task.profiles);

        // Safely extract the assigned user name
        let assignedUserName = '';
        if (task.profiles) {
          assignedUserName = task.profiles.display_name || task.profiles.email || '';
          console.log("Extracted assigned user name:", assignedUserName);
        }

        // Safely extract stage name
        let stageName = '';
        if (task.stage) {
          stageName = task.stage.name || '';
        }

        return {
          ...task,
          // Set both fields for compatibility with different components
          assignee_name: assignedUserName,
          assigned_user_name: assignedUserName,
          stage_name: stageName,
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
