
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TasksStats } from "../TasksStats";
import { useTasksStats } from "./useTasksStats";

export const TasksStatsCard = () => {
  const { data: stats, isLoading } = useTasksStats();

  if (isLoading) {
    return <Skeleton className="h-48 w-full" />;
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-bold mb-4">إحصائيات المهام</h2>
        <TasksStats stats={stats} />
      </CardContent>
    </Card>
  );
};
