// src/hooks/tasks/useTasksFetching.ts

export const useTasksFetching = (stageId: string) => {
  const { data: tasks, error, isLoading } = useQuery(
    ['tasks', stageId],
    async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('stage_id', stageId)
        .order('order_position', { nullsLast: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    }
  );

  return {
    tasks: tasks || [],
    error,
    isLoading
  };
};

