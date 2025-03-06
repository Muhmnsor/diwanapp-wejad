
import { TaskRow } from './TaskRow';

interface TaskGroupProps {
  groupKey: string;
  groupName: string;
  tasks: any[];
  months: Date[];
  today: Date;
}

export const TaskGroup = ({ groupKey, groupName, tasks, months, today }: TaskGroupProps) => {
  if (!tasks || tasks.length === 0) return null;
  
  return (
    <div className="mb-6">
      <div className="bg-gray-100 p-2 rounded-md mb-2 font-bold">
        {groupName || 'غير محدد'} ({tasks.length})
      </div>
      <div className="border rounded-md bg-white">
        {tasks.map((task) => (
          <TaskRow 
            key={task.id} 
            task={task} 
            months={months}
            today={today}
          />
        ))}
      </div>
    </div>
  );
};
