
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TopPerformer {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  stats: {
    completedTasks: number;
    completionRate: number;
    onTimeRate: number;
    averageCompletionTime: number;
  };
  achievements: number;
  rank?: number;
}

export interface PerformanceCategory {
  title: string;
  description: string;
  performers: TopPerformer[];
}

export const useTopPerformers = (period: 'monthly' | 'quarterly' | 'yearly' = 'monthly') => {
  return useQuery({
    queryKey: ['top-performers', period],
    queryFn: async (): Promise<{
      categories: PerformanceCategory[];
      monthlyLeaders: TopPerformer[];
      achievementLeaders: TopPerformer[];
    }> => {
      // Get all users with performance stats
      const { data: statsData, error: statsError } = await supabase
        .from('user_performance_stats')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          )
        `)
        .eq('stats_period', period);
        
      if (statsError) {
        console.error("Error fetching top performers:", statsError);
        throw statsError;
      }
      
      // Fetch achievement counts for each user
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('user_id, count')
        .eq('stats_period', period);
        
      if (achievementsError) {
        console.error("Error fetching achievements:", achievementsError);
      }
      
      // Process the user data
      const performers: TopPerformer[] = (statsData || []).map(record => {
        const userData = record.user || {};
        const metaData = userData.raw_user_meta_data || {};
        const achievements = achievementsData?.find(a => a.user_id === record.user_id)?.count || 0;
        
        return {
          id: record.user_id,
          name: metaData.full_name || metaData.name || userData.email?.split('@')[0] || 'مستخدم',
          email: userData.email,
          avatarUrl: metaData.avatar_url,
          stats: {
            completedTasks: record.completed_tasks_count || 0,
            completionRate: record.completion_rate || 0,
            onTimeRate: record.on_time_completion_rate || 0,
            averageCompletionTime: record.average_completion_time || 0
          },
          achievements: achievements
        };
      });
      
      // Sort by completion rate to get top overall performers
      const topOverallPerformers = [...performers]
        .sort((a, b) => b.stats.completionRate - a.stats.completionRate)
        .slice(0, 5)
        .map((performer, index) => ({...performer, rank: index + 1}));
      
      // Sort by on-time rate to get efficient performers
      const topEfficientPerformers = [...performers]
        .sort((a, b) => b.stats.onTimeRate - a.stats.onTimeRate)
        .slice(0, 5)
        .map((performer, index) => ({...performer, rank: index + 1}));
      
      // Sort by completion time (ascending) to get fastest performers
      const topFastestPerformers = [...performers]
        .filter(p => p.stats.averageCompletionTime > 0) // Filter out users with no completion time
        .sort((a, b) => a.stats.averageCompletionTime - b.stats.averageCompletionTime)
        .slice(0, 5)
        .map((performer, index) => ({...performer, rank: index + 1}));
      
      // Sort by tasks completed to get most productive
      const topProductivePerformers = [...performers]
        .sort((a, b) => b.stats.completedTasks - a.stats.completedTasks)
        .slice(0, 5)
        .map((performer, index) => ({...performer, rank: index + 1}));
        
      // Sort by achievements to get achievement leaders
      const achievementLeaders = [...performers]
        .sort((a, b) => b.achievements - a.achievements)
        .slice(0, 5)
        .map((performer, index) => ({...performer, rank: index + 1}));
      
      // Create categories
      const categories: PerformanceCategory[] = [
        {
          title: "أفضل الأداء الإجمالي",
          description: "المستخدمون الذين لديهم أعلى نسبة إنجاز للمهام",
          performers: topOverallPerformers
        },
        {
          title: "الأكثر التزامًا بالمواعيد",
          description: "المستخدمون الذين ينجزون مهامهم في الوقت المحدد",
          performers: topEfficientPerformers
        },
        {
          title: "الأسرع إنجازًا",
          description: "المستخدمون الذين يكملون المهام في أقل وقت",
          performers: topFastestPerformers
        },
        {
          title: "الأكثر إنتاجية",
          description: "المستخدمون الذين أكملوا أكبر عدد من المهام",
          performers: topProductivePerformers
        }
      ];
      
      // Return top performers data
      return {
        categories,
        monthlyLeaders: topProductivePerformers,
        achievementLeaders
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });
};
