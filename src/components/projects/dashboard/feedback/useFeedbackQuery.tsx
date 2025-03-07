
import { useCachedQuery } from "@/hooks/useCachedQuery";
import { supabase } from "@/integrations/supabase/client";

export const useFeedbackQuery = (projectId: string) => {
  return useCachedQuery({
    queryKey: ['project-activities-feedback', projectId],
    queryFn: async () => {
      console.log('Fetching activities feedback for project:', projectId);
      
      const { data: activities, error } = await supabase
        .from('project_activities')
        .select(`
          id,
          title,
          date,
          activity_feedback (
            overall_rating,
            content_rating,
            organization_rating,
            presenter_rating
          )
        `)
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching activities feedback:', error);
        throw error;
      }
      
      console.log('Fetched activities with feedback:', activities);
      
      return activities?.map(activity => ({
        id: activity.id,
        title: activity.title,
        date: activity.date,
        feedback: activity.activity_feedback || []
      })) || [];
    },
    // Enhanced caching options
    cacheDuration: 60 * 1000, // 1 minute
    cacheStorage: 'memory',
    useCompression: true,
    cachePriority: 'normal',
    tags: ['feedback', `project-${projectId}`],
    refreshStrategy: 'lazy',
    refreshThreshold: 50, // Refresh when 50% of the cache duration has passed
    offlineFirst: true, // Use cached data when offline
    
    // Enable progressive loading to show data as it comes in
    progressiveLoading: {
      enabled: true,
      chunkSize: 5,
      initialChunkSize: 3
    }
  });
};
