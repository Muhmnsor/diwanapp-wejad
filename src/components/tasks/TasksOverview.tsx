
import { TasksStatsCard } from "./stats/TasksStatsCard";
import { AssignedTasksCard } from "./assigned/AssignedTasksCard";

export const TasksOverview = () => {
  return (
    <div className="space-y-6">
      <TasksStatsCard />
      <AssignedTasksCard />
    </div>
  );
};
