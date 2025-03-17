
import { useState, useEffect } from "react";
import { MeetingTaskTypes } from "./MeetingTaskTypes";
import { useSmartQuery } from "@/hooks/useSmartQuery";
import { supabase } from "@/integrations/supabase/client";
import { MeetingTask } from "@/types/meeting";
import { useDeveloperStore } from "@/store/developerStore";

interface MeetingTasksListProps {
  meetingId: string | undefined;
}

export const MeetingTasksList = ({ meetingId }: MeetingTasksListProps) => {
  const { settings } = useDeveloperStore();
  const [isTasksFetched, setIsTasksFetched] = useState(false);
  
  const { data: tasks, isLoading, error } = useSmartQuery<MeetingTask[]>(
    ['meeting-tasks', meetingId],
    async () => {
      if (!meetingId) return [];
      
      const { data, error } = await supabase
        .from('meeting_tasks')
        .select('*')
        .eq('meeting_id', meetingId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching meeting tasks:', error);
        throw error;
      }
      
      return data as MeetingTask[];
    },
    {
      category: 'dynamic',
      useLocalCache: true,
      enabled: !!meetingId,
      onSuccess: () => setIsTasksFetched(true)
    }
  );
  
  useEffect(() => {
    if (isTasksFetched) {
      console.log(`Smart Cache: Loaded ${tasks?.length || 0} meeting tasks`);
    }
  }, [isTasksFetched, tasks?.length]);
  
  return <MeetingTaskTypes meetingId={meetingId} tasks={tasks} isLoading={isLoading} error={error} />;
};
