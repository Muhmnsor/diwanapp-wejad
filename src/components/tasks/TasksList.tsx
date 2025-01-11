import { ProjectTask } from "@/types/task";
import { TaskCard } from "./TaskCard";

interface TasksListProps {
  tasks: ProjectTask[];
}

export const TasksList = ({ tasks }: TasksListProps) => {
  if (!tasks.length) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-500">لا توجد مهام في هذا المشروع</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};