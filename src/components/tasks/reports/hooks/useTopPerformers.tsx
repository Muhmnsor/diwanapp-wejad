
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TopPerformer {
  id: string;
  name: string;
  avatar?: string;
  stats: {
    completedTasks: number;
    completionRate: number;
    onTimeRate: number;
    averageCompletionTime: number;
    achievements: number;
  };
}

export interface PerformanceCategory {
  id: string;
  title: string;
  description: string;
  performers: TopPerformer[];
}

export const useTopPerformers = (period: 'weekly' | 'monthly' | 'quarterly' = 'monthly') => {
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [categories, setCategories] = useState<PerformanceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopPerformers = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Calculate date range based on period
        const endDate = new Date();
        let startDate = new Date();
        
        if (period === 'weekly') {
          startDate.setDate(startDate.getDate() - 7);
        } else if (period === 'monthly') {
          startDate.setMonth(startDate.getMonth() - 1);
        } else if (period === 'quarterly') {
          startDate.setMonth(startDate.getMonth() - 3);
        }
        
        // Get user performance stats from the database
        const { data: statsData, error: statsError } = await supabase
          .from('user_performance_stats')
          .select(`
            user_id,
            completed_tasks_count,
            completion_rate,
            on_time_completion_rate,
            average_completion_time
          `)
          .eq('stats_period', period);
        
        if (statsError) {
          throw statsError;
        }
        
        // Get user achievements count
        const { data: achievementsData, error: achievementsError } = await supabase
          .from('user_achievements')
          .select('user_id, count')
          .gte('achieved_at', startDate.toISOString())
          .lt('achieved_at', endDate.toISOString())
          .order('count', { ascending: false });
          
        if (achievementsError) {
          console.error('Error fetching achievements:', achievementsError);
        }
        
        // Get user profiles
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, email');
          
        if (profilesError) {
          throw profilesError;
        }
        
        // Process the data and create top performers list
        const performers: TopPerformer[] = statsData?.map(stats => {
          const profile = profilesData.find(p => p.id === stats.user_id) || { 
            display_name: 'مستخدم غير معروف', 
            email: '' 
          };
          
          const achievements = achievementsData?.filter(a => a.user_id === stats.user_id)?.length || 0;
          
          return {
            id: stats.user_id,
            name: profile.display_name || profile.email || 'مستخدم',
            stats: {
              completedTasks: stats.completed_tasks_count || 0,
              completionRate: stats.completion_rate || 0,
              onTimeRate: stats.on_time_completion_rate || 0,
              averageCompletionTime: stats.average_completion_time || 0,
              achievements: achievements
            }
          };
        }) || [];
        
        // Sort by most completed tasks
        performers.sort((a, b) => b.stats.completedTasks - a.stats.completedTasks);
        
        // Create performance categories
        const performanceCategories: PerformanceCategory[] = [
          {
            id: 'completion',
            title: 'الأكثر إنجازاً للمهام',
            description: 'المستخدمون الذين أنجزوا أكبر عدد من المهام',
            performers: [...performers].sort((a, b) => b.stats.completedTasks - a.stats.completedTasks).slice(0, 3)
          },
          {
            id: 'onTime',
            title: 'الأفضل التزاماً بالمواعيد',
            description: 'المستخدمون الأكثر التزاماً بمواعيد تسليم المهام',
            performers: [...performers].sort((a, b) => b.stats.onTimeRate - a.stats.onTimeRate).slice(0, 3)
          },
          {
            id: 'speed',
            title: 'الأسرع في إنجاز المهام',
            description: 'المستخدمون الذين ينجزون المهام في وقت أقل',
            performers: [...performers].sort((a, b) => a.stats.averageCompletionTime - b.stats.averageCompletionTime).slice(0, 3)
          },
          {
            id: 'productivity',
            title: 'الأعلى إنتاجية',
            description: 'المستخدمون ذوو معدل إكمال المهام الأعلى',
            performers: [...performers].sort((a, b) => b.stats.completionRate - a.stats.completionRate).slice(0, 3)
          },
          {
            id: 'achievements',
            title: 'الأكثر تحقيقاً للإنجازات',
            description: 'المستخدمون الذين حققوا أكبر عدد من الإنجازات',
            performers: [...performers].sort((a, b) => b.stats.achievements - a.stats.achievements).slice(0, 3)
          }
        ];
        
        setTopPerformers(performers);
        setCategories(performanceCategories);
      } catch (error) {
        console.error('Error fetching top performers:', error);
        setError('حدث خطأ أثناء جلب بيانات أفضل المستخدمين');
        toast.error('فشل في تحميل بيانات أفضل المستخدمين');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTopPerformers();
  }, [period]);
  
  return {
    topPerformers,
    categories,
    isLoading,
    error
  };
};
