import { TaskCard } from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  assigned_to: {
    email: string;
  } | null;
  status: string;
  priority: string;
  updated_at: string;
}

interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div className="grid gap-4">
      {tasks?.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  );
};