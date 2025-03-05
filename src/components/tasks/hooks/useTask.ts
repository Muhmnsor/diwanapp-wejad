
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "../project-details/types/task";
import { toast } from "sonner";

export const useTask = (taskId: string | undefined) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTask = async () => {
    if (!taskId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          assigned_user:assigned_to(id, email, display_name),
          project:project_id(id, name),
          stage:stage_id(id, name)
        `)
        .eq('id', taskId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our Task type
        const taskData: Task = {
          ...data,
          assigned_user_name: data.assigned_user?.display_name || null,
          project_name: data.project?.name || null,
          stage_name: data.stage?.name || null
        };
        setTask(taskData);
      }
    } catch (err) {
      console.error("Error fetching task:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error("حدث خطأ أثناء جلب بيانات المهمة");
    } finally {
      setIsLoading(false);
    }
  };

  const refetchTask = () => {
    fetchTask();
  };

  useEffect(() => {
    fetchTask();
  }, [taskId]);

  return { task, isLoading, error, refetchTask };
};
