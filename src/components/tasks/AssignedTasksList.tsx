import { useAssignedTasks } from "./hooks/useAssignedTasks";
import { TasksLoadingState } from "./components/TasksLoadingState";
import { TasksEmptyState } from "./components/TasksEmptyState";
import { TaskListItem } from "./components/TaskListItem";

export const AssignedTasksList = () => {
  const { data: tasks, isLoading } = useAssignedTasks();

  if (isLoading) {
    return <TasksLoadingState />;
  }

  if (!tasks || tasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </div>
  );
};
