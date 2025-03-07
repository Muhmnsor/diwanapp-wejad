
import { TaskCard } from './TaskCard';
import { Task } from '@/types/workspace';

interface TaskListProps {
  tasks: Task[];
}

export const TaskList = ({ tasks }: TaskListProps) => {
  console.log('📋 TaskList - Rendering tasks:', tasks);
  
  if (!tasks || tasks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        لا توجد مهام حالياً
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {tasks.map((task) => (
        <TaskCard 
          key={task.id} 
          task={task}
        />
      ))}
    </div>
  );
};
