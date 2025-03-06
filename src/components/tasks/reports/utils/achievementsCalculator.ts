
import { supabase } from "@/integrations/supabase/client";

// Achievement types
const ACHIEVEMENT_TYPES = {
  COMPLETION: 'completion',
  PERFORMANCE: 'performance',
  QUALITY: 'quality'
};

// Achievement thresholds
const ACHIEVEMENTS = [
  {
    type: ACHIEVEMENT_TYPES.COMPLETION,
    title: 'إنجاز 10 مهام',
    description: 'أكمل 10 مهام بنجاح',
    threshold: 10,
    metric: 'completedTasksCount'
  },
  {
    type: ACHIEVEMENT_TYPES.COMPLETION,
    title: 'إنجاز 25 مهمة',
    description: 'أكمل 25 مهمة بنجاح',
    threshold: 25,
    metric: 'completedTasksCount'
  },
  {
    type: ACHIEVEMENT_TYPES.COMPLETION,
    title: 'إنجاز 50 مهمة',
    description: 'أكمل 50 مهمة بنجاح',
    threshold: 50,
    metric: 'completedTasksCount'
  },
  {
    type: ACHIEVEMENT_TYPES.PERFORMANCE,
    title: 'نسبة إنجاز 75%',
    description: 'حقق نسبة إنجاز 75% من المهام',
    threshold: 75,
    metric: 'completionRate'
  },
  {
    type: ACHIEVEMENT_TYPES.PERFORMANCE,
    title: 'نسبة إنجاز 90%',
    description: 'حقق نسبة إنجاز 90% من المهام',
    threshold: 90,
    metric: 'completionRate'
  },
  {
    type: ACHIEVEMENT_TYPES.QUALITY,
    title: 'الالتزام بالمواعيد',
    description: 'أنجز 90% من المهام في الوقت المحدد',
    threshold: 90,
    metric: 'onTimeCompletionRate'
  }
];

/**
 * Calculate user achievements and update the database
 */
export const calculateUserAchievements = async (userId: string) => {
  try {
    if (!userId) return;
    
    // Get current user performance statistics
    const { data: userStats, error: statsError } = await supabase
      .from('user_performance_stats')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (statsError && statsError.code !== 'PGRST116') {
      console.error("Error fetching user stats:", statsError);
      return;
    }
    
    if (!userStats) {
      console.log("No user stats found, skipping achievements calculation");
      return;
    }
    
    // Get existing achievements
    const { data: existingAchievements, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_title')
      .eq('user_id', userId);
      
    if (achievementsError) {
      console.error("Error fetching existing achievements:", achievementsError);
      return;
    }
    
    const existingTitles = (existingAchievements || []).map(a => a.achievement_title);
    
    // Calculate new achievements
    const newAchievements = ACHIEVEMENTS.filter(achievement => {
      // Skip if already achieved
      if (existingTitles.includes(achievement.title)) return false;
      
      // Check if threshold met
      const metricValue = userStats[achievement.metric] || 0;
      return metricValue >= achievement.threshold;
    });
    
    // Add new achievements
    if (newAchievements.length > 0) {
      const { error: insertError } = await supabase
        .from('user_achievements')
        .insert(newAchievements.map(achievement => ({
          user_id: userId,
          achievement_type: achievement.type,
          achievement_title: achievement.title,
          achievement_description: achievement.description,
          metrics: {
            threshold: achievement.threshold,
            achieved_value: userStats[achievement.metric] || 0
          }
        })));
        
      if (insertError) {
        console.error("Error inserting achievements:", insertError);
      } else {
        console.log(`Added ${newAchievements.length} new achievements for user ${userId}`);
      }
    }
  } catch (error) {
    console.error("Error calculating achievements:", error);
  }
};

/**
 * Update user stats based on task activities
 */
export const updateUserStats = async (userId: string) => {
  try {
    if (!userId) return;
    
    // Fetch all user tasks
    const [
      { data: tasks, error: tasksError },
      { data: portfolioTasks, error: portfolioTasksError },
      { data: projectTasks, error: projectTasksError },
      { data: subtasks, error: subtasksError }
    ] = await Promise.all([
      supabase
        .from('tasks')
        .select('status, created_at, updated_at, due_date')
        .eq('assigned_to', userId),
      
      supabase
        .from('portfolio_tasks')
        .select('status, created_at, updated_at, due_date')
        .eq('assigned_to', userId),
      
      supabase
        .from('project_tasks')
        .select('status, created_at, updated_at, due_date')
        .eq('assigned_to', userId),
        
      supabase
        .from('subtasks')
        .select('status, created_at, updated_at, due_date')
        .eq('assigned_to', userId)
    ]);
    
    if (tasksError || portfolioTasksError || projectTasksError || subtasksError) {
      console.error("Error fetching tasks");
      return;
    }
    
    // Combine all tasks
    const allTasks = [
      ...(tasks || []),
      ...(portfolioTasks || []),
      ...(projectTasks || []),
      ...(subtasks || [])
    ];
    
    // Calculate stats
    const totalTasksCount = allTasks.length;
    const completedTasksCount = allTasks.filter(task => task.status === 'completed').length;
    const completionRate = totalTasksCount > 0 
      ? Math.round((completedTasksCount / totalTasksCount) * 100) 
      : 0;
    
    // Calculate on-time completion rate
    const completedWithDueDate = allTasks.filter(task => 
      task.status === 'completed' && task.due_date && task.updated_at
    );
    
    const onTimeCount = completedWithDueDate.filter(task => 
      new Date(task.updated_at) <= new Date(task.due_date)
    ).length;
    
    const onTimeCompletionRate = completedWithDueDate.length > 0
      ? Math.round((onTimeCount / completedWithDueDate.length) * 100)
      : 0;
    
    // Calculate average completion time
    const completionTimes = completedWithDueDate.map(task => {
      const createdDate = new Date(task.created_at);
      const completedDate = new Date(task.updated_at);
      return (completedDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60); // hours
    });
    
    const averageCompletionTime = completionTimes.length > 0
      ? Math.round(completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length)
      : 0;
    
    // Generate monthly data for stats
    const now = new Date();
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const month = new Date(now);
      month.setMonth(month.getMonth() - i);
      
      const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
      const monthName = month.toLocaleDateString('ar-SA', { month: 'long' });
      
      const monthTasks = allTasks.filter(task => {
        const taskDate = new Date(task.created_at);
        const taskMonthKey = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}`;
        return taskMonthKey === monthKey;
      });
      
      const completedInMonth = monthTasks.filter(task => task.status === 'completed').length;
      
      monthlyData.push({
        month: monthName,
        total: monthTasks.length,
        completed: completedInMonth
      });
    }
    
    // Upsert user stats
    const { error: upsertError } = await supabase
      .from('user_performance_stats')
      .upsert({
        user_id: userId,
        total_tasks_count: totalTasksCount,
        completed_tasks_count: completedTasksCount,
        completion_rate: completionRate,
        average_completion_time: averageCompletionTime,
        on_time_completion_rate: onTimeCompletionRate,
        stats_data: {
          monthly: monthlyData.reverse() // Oldest month first
        },
        last_updated: new Date().toISOString()
      });
      
    if (upsertError) {
      console.error("Error upserting user stats:", upsertError);
    } else {
      console.log(`Updated stats for user ${userId}`);
      
      // Calculate and update achievements
      await calculateUserAchievements(userId);
    }
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
};
