
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../types/task";
import { toast } from "sonner";

export const useTasksFetching = (projectId?: string, meetingId?: string, isWorkspace?: boolean) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tasksByStage, setTasksByStage] = useState<Record<string, Task[]>>({});

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('tasks')
        .select('*, profiles:assigned_to(display_name, email), stage:stage_id(name)');

      // Filter based on what's provided
      if (projectId) {
        query = query.eq('project_id', projectId);
      } else if (meetingId) {
        query = query.eq('meeting_id', meetingId);
      } else if (isWorkspace) {
        query = query.eq('is_workspace', true);
      } else {
        // General tasks
        query = query.eq('is_general', true);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }

      console.log("Fetched tasks:", data);

      // Transform data to add user info and stage name
      const transformedTasks = data.map(task => ({
        ...task,
        assigned_user_name: task.profiles?.display_name || task.profiles?.email || '',
        stage_name: task.stage?.name || '',
      }));

      setTasks(transformedTasks);

      // Group tasks by stage for project tasks with stages
      if (projectId) {
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
