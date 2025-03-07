
import { TaskCard } from './TaskCard';
import { Task } from '@/types/workspace'; // Use the workspace Task interface

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
          task={{
            id: task.id,
            title: task.title || '',
            description: task.description || null,
            due_date: task.due_date || null,
            assigned_to: task.assigned_to || null,
            status: task.status || 'pending',
            priority: task.priority || 'medium',
            updated_at: task.updated_at || new Date().toISOString(),
          }} 
        />
      ))}
    </div>
  );
};
