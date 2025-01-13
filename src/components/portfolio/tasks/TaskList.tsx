import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: any[];
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