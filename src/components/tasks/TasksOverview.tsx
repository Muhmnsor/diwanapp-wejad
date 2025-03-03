
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { PendingTasksList } from "./PendingTasksList";
import { TasksStats } from "./TasksStats";
import { Skeleton } from "@/components/ui/skeleton";

export const TasksOverview = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['tasks-stats'],
    queryFn: async () => {
      // في المستقبل سنقوم بجلب إحصائيات المهام من قاعدة البيانات
      // هذه بيانات وهمية مؤقتة
      return {
        totalTasks: 24,
        completedTasks: 16,
        pendingTasks: 8,
        upcomingDeadlines: 3
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">إحصائيات المهام</h2>
          <TasksStats stats={stats} />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">المهام قيد التنفيذ</h2>
          <PendingTasksList />
        </CardContent>
      </Card>
    </div>
  );
};
